import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import {
  ASSISTED_CASE,
  POLICY,
  evaluateWithRules,
} from "@/lib/experiment";
import { GOLD_ASSISTANT_DRAFT } from "@/lib/reviewed-example";

export const runtime = "nodejs";

const RequestSchema = z.object({
  action: z.enum(["draft", "challenge"]),
  customerReply: z.string().max(12_000).default(""),
  internalNote: z.string().max(12_000).default(""),
});

const AssistantSchema = z.object({
  customerReply: z.string(),
  internalNote: z.string(),
  checks: z.array(z.string()).min(1).max(5),
  caution: z.string(),
});

const VISIBLE_ASSISTED_CASE = Object.fromEntries(
  Object.entries(ASSISTED_CASE).filter(([key]) => key !== "gold"),
);

export function buildAssistPrompt(
  action: "draft" | "challenge",
  customerReply: string,
  internalNote: string,
) {
  return `Policy\n${POLICY.sections.map((section) => `${section.id}. ${section.title}: ${section.body}`).join("\n")}\n\nVisible case evidence\n${JSON.stringify(VISIBLE_ASSISTED_CASE, null, 2)}\n\nCurrent customer reply\n${customerReply || "[empty]"}\n\nCurrent internal note\n${internalNote || "[empty]"}\n\nRequested mode: ${action}. If drafting, produce a concise, safe customer reply and an auditable internal note. If challenging, improve the current work and call out its most consequential weakness. Never approve a decision that requires human review.`;
}

function guidedChallenge(customerReply: string, internalNote: string, warning?: string) {
  const evaluation = evaluateWithRules(customerReply, internalNote, 1);
  const failed = evaluation.gates.filter((gate) => gate.status === "fail");
  const checks = failed.length
    ? failed.slice(0, 5).map((gate) => `${gate.id} ${gate.label}: ${gate.evidence}`)
    : [
        "All five case-specific deterministic gates pass on the current text.",
        "This rules check is not a general semantic safety proof; retain human review for the final commitment.",
      ];

  return {
    customerReply,
    internalNote,
    checks,
    caution:
      failed.length > 0
        ? evaluation.priority
        : "Human sign-off remains required even when every automated check passes.",
    action: "challenge" as const,
    canApply: false,
    mode: "guided-demo" as const,
    model: "Deterministic challenge · no external model call",
    promptVersion: "assist-v1.2",
    usage: null,
    warning,
  };
}

function reviewedExample(warning?: string) {
  return {
    ...GOLD_ASSISTANT_DRAFT,
    action: "draft" as const,
    canApply: true,
    mode: "guided-demo" as const,
    model: "Reviewed example · no external model call",
    promptVersion: "assist-v1.2",
    usage: null,
    warning:
      warning ??
      "This is curated demo content, not model output. Review or edit it before scoring.",
  };
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      parsed.data.action === "challenge"
        ? guidedChallenge(parsed.data.customerReply, parsed.data.internalNote)
        : reviewedExample(),
    );
  }

  try {
    const client = new OpenAI({ apiKey, timeout: 18_000, maxRetries: 1 });
    const model = process.env.OPENAI_ASSIST_MODEL || "gpt-5.6-luna";
    const response = await client.responses.parse({
      model,
      reasoning: { effort: "low" },
      store: false,
      instructions:
        "You are an enterprise support copilot inside a controlled work simulation. Use only the supplied evidence and policy. Separate eligibility from approval. Preserve human authority over security, legal, regulated, and exception decisions. Return only the requested structured result.",
      input: buildAssistPrompt(
        parsed.data.action,
        parsed.data.customerReply,
        parsed.data.internalNote,
      ),
      text: {
        format: zodTextFormat(AssistantSchema, "rolelab_assistant"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("The assistant returned no parsed output.");
    }

    return Response.json({
      ...response.output_parsed,
      action: parsed.data.action,
      canApply: true,
      mode: "live-ai",
      model,
      promptVersion: "assist-v1.2",
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          }
        : null,
    });
  } catch (error) {
    console.error("RoleLab assist fallback", error);
    const warning = "The live copilot was unavailable; this response is explicitly local fallback output.";
    const fallback =
      parsed.data.action === "challenge"
        ? guidedChallenge(parsed.data.customerReply, parsed.data.internalNote, warning)
        : reviewedExample(warning);
    return Response.json({ ...fallback, mode: "guided-fallback" });
  }
}
