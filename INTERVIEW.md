# Founder interview questions and answers

## 1. Who buys this, and what are they buying?

The economic buyer is usually a Head of AI, COO, or L&D leader with the functional manager. They are buying evidence for a workflow decision—not another course: which steps to automate, which to augment, which to keep human-owned, and what capability gap prevents safe rollout.

## 2. Tai already has workflow discovery, readiness, assessment, and training. Why build this?

RoleLab is an experiment primitive inside that loop. Tai can discover a workflow and teach it; RoleLab gives the team a controlled way to compare operating conditions and produce a step-level rule. Its failure evidence then feeds Tai’s existing training and certification surfaces.

## 3. Isn’t this just Skillprint’s human/AI/human+AI benchmark?

The three-arm design is not my novelty claim. Skillprint is a useful adjacent precedent. The proposed production RoleLab starts from a customer’s versioned enterprise workflow and policy, evaluates step-level controls, produces an operating rule, and turns weak steps into role training. My bounded claim covers only that complete loop in the public sample I reviewed.

## 4. Can one triad justify the division map?

No. The public prototype is not even an empirical triad: it has one current scored artifact and two illustrative seeded reference rows. A real experiment needs multiple matched cases and participants, SME labels, randomised condition order and case-arm assignment, uncertainty intervals, and delayed transfer. The prototype demonstrates the decision and instrumentation before asking a customer to fund that validation.

## 5. Why are two arms seeded?

It keeps a 90-second public demo focused while making the distinction explicit. The current artifact is genuinely editable, optionally assisted, and scored server-side. In a customer pilot all three arms would be assigned and persisted; the public demo reference rows are illustrative data, never presented as a benchmark.

## 6. Can an LLM be trusted to score employees?

Not by itself. Critical policy rules are deterministic and authoritative. The model sees no arm label and returns structured dimension scores with exact quotes; the server validates quote grounding and the model cannot override a failed gate. Before employee use, I would calibrate against two human raters, audit every serious miss, route ambiguous cases to review, and provide an appeal path.

## 7. Why no RAG, agent framework, or fine-tuning?

There are four small, versioned sources. Complete bounded context is cheaper to audit and has fewer failure modes. Retrieval becomes justified when the corpus exceeds a clear latency/cost/access-filter threshold. Fine-tuning becomes useful only after we own enough quality-labelled examples. An agent framework would not improve this fixed state machine.

## 8. How do you prevent prompt injection or gaming?

Production would structurally separate trusted policy/instructions from untrusted source content, expose no action tools to the evaluator, keep rubrics and gold cases server-side, validate all outputs, and run prompt-injection regression cases. Unseen matched cases reduce memorisation. Suspicious traces route to human review; they do not silently become a punitive score.

## 9. What does a session cost, and what happens when the model fails?

The planning estimate is $0.05 for one assistance call plus one evaluation call, or $0.06 with 20% retry/headroom, using the documented Luna/Terra token assumptions. Repeated sidecar calls add cost. The current code returns the mode and per-call token usage when available; production would aggregate them into a durable session ledger. Calls have bounded timeouts/retry and a rules fallback. Production also adds durable idempotency, a queue, rate limits, cost ceilings, and alerts. Actual token and latency logs replace the planning estimate after a pilot.

## 10. What would you validate next?

First, evaluator validity: 24 SME-labelled traces, zero false passes for critical violations, and at least 0.70 rank correlation with human consensus. Then, workflow value: a randomised pilot measuring quality, critical errors, rework, time, and total execution cost, followed by an unseen task one or two weeks later. The go/no-go question is whether the evidence changes both the operating procedure and the training assignment.
