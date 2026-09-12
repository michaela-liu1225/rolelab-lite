import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import {
  ASSISTED_CASE,
  DimensionResult,
  EvaluationResult,
  POLICY,
  evaluateWithRules,
} from "@/lib/experiment";

export const runtime = "nodejs";

const RequestSchema = z.object({
  customerReply: z.string().min(20).max(12_000),
  internalNote: z.string().min(20).max(12_000),
  durationSeconds: z.number().int().min(1).max(7_200),
});

const JudgedDimension = z.object({
  score: z.number(),
  evidence: z.string(),
  note: z.string(),
});

const ModelEvaluationSchema = z.object({
  decision: JudgedDimension,
  calculation: JudgedDimension,
  risk: JudgedDimension,
  communication: JudgedDimension,
  priority: z.string(),
});

type ModelEvaluation = z.infer<typeof ModelEvaluationSchema>;

function evaluatorPrompt(
  customerReply: string,
  internalNote: string,
  gates: ReturnType<typeof evaluateWithRules>["gates"],
) {
  return `You are blind to the experiment condition. Evaluate only the submitted artifact against the versioned policy and case. Do not reward verbosity. Deterministic gates are authoritative; your job is to assess quality within the rubric.\n\nPolicy ${POLICY.id}\n${POLICY.sections.map((section) => `${section.id}. ${section.title}: ${section.body}`).join("\n")}\n\nCase\n${JSON.stringify(ASSISTED_CASE, null, 2)}\n\nCustomer reply\n${customerReply}\n\nInternal note\n${internalNote}\n\nDeterministic gates\n${JSON.stringify(gates, null, 2)}\n\nRubric: decision correctness 0–30; calculation and evidence 0–25; risk and escalation 0–20; customer communication 0–15. For each evidence field, quote one exact contiguous 6–20 word span from the submitted artifact. Give one priority next action.`;
}

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function groundedEvidence(candidate: string, artifact: string, fallback: string) {
  const quote = candidate.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[“”‘’]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const normalizedQuote = normalize(quote);
  const wordCount = normalizedQuote.split(" ").filter(Boolean).length;

  if (wordCount >= 6 && wordCount <= 20 && normalize(artifact).includes(normalizedQuote)) {
    return `“${quote}”`;
  }
  return fallback;
}

function mergeModelJudgment(
  base: ReturnType<typeof evaluateWithRules>,
  judged: ModelEvaluation,
  artifact: string,
): Pick<
  EvaluationResult,
  "dimensions" | "rawScore" | "score" | "status" | "priority"
> {
  const fallbackFor = (id: string) =>
    base.dimensions.find((item) => item.id === id)?.evidence ?? "No grounded evidence found.";
  const trace = base.dimensions.find((item) => item.id === "trace")!;
  const dimensions: DimensionResult[] = [
    {
      id: "decision",
      label: "Decision correctness",
      max: 30,
      score: clamp(judged.decision.score, 30),
      evidence: groundedEvidence(judged.decision.evidence, artifact, fallbackFor("decision")),
      note: judged.decision.note,
    },
    {
      id: "calculation",
      label: "Calculation & evidence",
      max: 25,
      score: clamp(judged.calculation.score, 25),
      evidence: groundedEvidence(judged.calculation.evidence, artifact, fallbackFor("calculation")),
      note: judged.calculation.note,
    },
    {
      id: "risk",
      label: "Risk & escalation",
      max: 20,
      score: clamp(judged.risk.score, 20),
      evidence: groundedEvidence(judged.risk.evidence, artifact, fallbackFor("risk")),
      note: judged.risk.note,
    },
    {
      id: "communication",
      label: "Customer communication",
      max: 15,
      score: clamp(judged.communication.score, 15),
      evidence: groundedEvidence(judged.communication.evidence, artifact, fallbackFor("communication")),
      note: judged.communication.note,
    },
    trace,
  ];

  const rawScore = dimensions.reduce((sum, item) => sum + item.score, 0);
  const checksPassed = base.gates.every((gate) => gate.status === "pass") && rawScore >= 90;

  return {
    dimensions,
    rawScore,
    score: base.gates.every((gate) => gate.status === "pass")
      ? rawScore
      : Math.min(rawScore, 59),
    status: checksPassed ? "Human review required" : "Not deployable",
    priority: judged.priority,
  };
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Both artifacts need at least 20 characters.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { customerReply, internalNote, durationSeconds } = parsed.data;
  const base = evaluateWithRules(customerReply, internalNote, durationSeconds);
  const runId = `RL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const result: EvaluationResult = {
      ...base,
      runId,
      mode: "rules-only",
      model: "Deterministic policy evaluator",
      promptVersion: "eval-v1.3",
    };
    return Response.json(result);
  }

  try {
    const client = new OpenAI({ apiKey, timeout: 22_000, maxRetries: 1 });
    const model = process.env.OPENAI_EVALUATOR_MODEL || "gpt-5.6-terra";
    const response = await client.responses.parse({
      model,
      reasoning: { effort: "low" },
      store: false,
      instructions:
        "You are a strict enterprise-work evaluator. You are blind to whether a human or AI produced the artifact. Use only supplied policy and evidence. Deterministic critical gates are authoritative. Return only the structured rubric judgment.",
      input: evaluatorPrompt(customerReply, internalNote, base.gates),
      text: {
        format: zodTextFormat(ModelEvaluationSchema, "rolelab_evaluation"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("The evaluator returned no parsed output.");
    }

    const merged = mergeModelJudgment(
      base,
      response.output_parsed,
      `${customerReply}\n${internalNote}`,
    );
    const result: EvaluationResult = {
      ...base,
      ...merged,
      runId,
      mode: "live-ai",
      model,
      promptVersion: "eval-v1.3",
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          }
        : undefined,
    };
    return Response.json(result);
  } catch (error) {
    console.error("RoleLab evaluator fallback", error);
    const result: EvaluationResult = {
      ...base,
      runId,
      mode: "rules-fallback",
      model: "Deterministic policy evaluator",
      promptVersion: "eval-v1.3",
      warning: "The model judge was unavailable. Critical gates and the local rubric still ran.",
    };
    return Response.json(result);
  }
}
