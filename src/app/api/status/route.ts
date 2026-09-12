export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  return Response.json({
    configured,
    mode: configured ? "Live AI configured" : "Guided demo mode",
    assistModel: configured
      ? process.env.OPENAI_ASSIST_MODEL || "gpt-5.6-luna"
      : "Reviewed fallback",
    evaluatorModel: configured
      ? process.env.OPENAI_EVALUATOR_MODEL || "gpt-5.6-terra"
      : "Deterministic policy evaluator",
  });
}
