import assert from "node:assert/strict";
import test from "node:test";
import { POST, buildAssistPrompt } from "../src/app/api/assist/route";

test("live sidecar prompt excludes evaluator-only gold answers", () => {
  const prompt = buildAssistPrompt("draft", "", "");

  assert.doesNotMatch(prompt, /"gold"/);
  assert.doesNotMatch(prompt, /\$4,950/);
  assert.doesNotMatch(prompt, /99\.8264%/);
  assert.doesNotMatch(prompt, /Pending Security \+ Legal review/);
  assert.match(prompt, /Visible case evidence/);
});

test("guided challenge evaluates the current text instead of replacing it with the gold draft", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const customerReply = "Thanks for your note. We are still looking into this request.";
    const internalNote = "No calculation or review decision has been completed for this request.";
    const response = await POST(
      new Request("http://rolelab.test/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge", customerReply, internalNote }),
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.action, "challenge");
    assert.equal(payload.canApply, false);
    assert.equal(payload.customerReply, customerReply);
    assert.equal(payload.internalNote, internalNote);
    assert.match(payload.checks.join(" "), /G1 Eligibility/);
  } finally {
    if (previousKey) process.env.OPENAI_API_KEY = previousKey;
  }
});
