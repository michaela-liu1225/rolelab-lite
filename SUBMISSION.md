# What I Would Build for Tai Labs

**Candidate:** Yuxin Liu

**Prototype:** RoleLab Lite

**Live demo:** https://rolelab-lite.vercel.app

**GitHub:** https://github.com/michaela-liu1225/rolelab-lite

**Research cut-off:** 12 September 2026

## Product thesis

Tai already teaches role-specific AI skills. I would add an **evidence-based work-design** layer: choose valuable workflows, test where AI helps or harms them, and turn observed failures into training. Organisations need this because human+AI is not automatically best: a 106-experiment meta-analysis found combinations underperformed the better standalone actor on average, with strong task variation and little deliberate subtask allocation. [Nature Human Behaviour](https://www.nature.com/articles/s41562-024-02024-1)

I would build three connected tools around that gap.

## 1. Workflow Scout — find the right work

**What it does.** From an SOP, sample artifacts, and a narrated walkthrough, Workflow Scout creates a reviewed task graph tagged for automation potential, judgment, sensitivity, policy, and measurable outcome. It proposes experiments rather than calling an entire workflow “AI-ready.”

**Who it is for.** Operations/AI leaders, functional managers, and L&D teams allocating transformation and training budgets.

**Why it is valuable.** It starts with valuable work, producing ranked hypotheses with an owner, baseline, risk boundary, and success measure—then a targeted training backlog.

**How I would build it.** Next.js intake would feed an asynchronous extraction/redaction pipeline. Terra Structured Outputs would produce a typed graph; deterministic checks would flag prohibited data and approvals. PostgreSQL would version sources, steps, rules, hypotheses, and reviewer decisions. A process owner must publish the result.

## 2. RoleLab — learn the division of labour

**What it does.** RoleLab compares matched human-only, AI-only, and human+AI work, measuring quality, time, rework, critical risk, and cost. It outputs step-level `AI-first`, `human+AI`, or `human-owned` rules with required controls.

**Who it is for.** AI/operations leaders designing work, L&D teams assigning practice, and employees learning a workflow safely.

**Why it is valuable.** Usage does not prove better work. RoleLab can show, for example, that AI should extract and calculate, a human should verify causal exclusions, and data-integrity approval should remain human-owned. Weak steps become training.

**How I would build it.** A Next.js orchestrator would assign cases via a Latin square. Small versioned packs fit complete context; Luna assists, Terra scores subjective dimensions, and deterministic eligibility/money/escalation/safety gates remain authoritative. PostgreSQL versions scenarios, artifacts, decisions, scores, evals, and prompts.

## 3. Near-Miss Loop — make training respond to reality

**What it does.** Approved users submit an AI override or near miss. The tool redacts and clusters it, drafts a role-specific simulation, and lets an SME approve it before assignment and recurrence tracking.

**Who it is for.** AI governance, quality, compliance, and L&D teams whose model mistakes disappear into chats or incident logs.

**Why it is valuable.** It makes static training respond to actual work while preserving review and privacy boundaries.

**How I would build it.** An event API would accept minimal artifacts and taxonomy fields. DLP runs before storage/model access; embeddings cluster within access boundaries; Terra drafts a scenario/rubric; an SME approves it. PostgreSQL versions events, redactions, clusters, drills, approvals, assignments, and recurrence. Nothing becomes disciplinary evidence automatically.

### Deployment and proof across the suite

| Tool | Deployment and main cost | Reliability boundary | How it improves and proves capability |
|---|---|---|---|
| Workflow Scout | Authenticated intake + asynchronous document pipeline; extraction, model tokens, and process-owner review dominate cost | Tenant-scoped sources, DLP before model access, typed output, owner approval before publication | Accepted task graphs and funded experiments show discovery value; approved weak steps become the role’s training backlog |
| RoleLab | Interactive web/API + evaluation workers; scenario authoring, reviewer time, and model calls dominate | Deterministic gates, blinded rubric, versioned cases, no action tools, appeal path | Human agreement validates scoring; randomised arms measure errors, rework, time, cost, and delayed transfer; weak steps become practice |
| Near-Miss Loop | Authenticated event API + redaction/clustering queue; redaction and SME review dominate | Minimal retention, source access control, SME approval, non-disciplinary default | Drill pass rates and later recurrence measure learning; only approved patterns become targeted simulations and recertification |

## Why I built RoleLab Lite

RoleLab has the best five-minute combination of customer value and technical depth; the other ideas need customer documents or governance owners. This synthetic build verifies evaluator behaviour, failure handling, and the decision UI. It does not claim to have run the proposed experiment.

The fictional cloud-support design uses one SLA, an excluded downtime segment and invoice line, a 10% credit band, and a mandatory escalation. Only Harbor Analytics is editable; the other rows are illustrative.

- **Human-only / EmberCRM:** illustrative seeded row — score 92 in 11m42s; no underlying artifact is claimed.
- **AI-only / Meridian Pay:** illustrative seeded row — score 58, not deployable, with excluded-maintenance and review failures.
- **Current / Harbor Analytics:** the reviewer inspects four evidence sources, optionally asks a bounded sidecar for help, edits a customer reply and internal trace, and submits the artifact for server-side evaluation.

Five case-specific gates run before the rubric. A supported eligibility, downtime, money, escalation, or safety conflict marks the artifact `NOT_DEPLOYABLE` and caps its score at 59; quality must also reach 90. Clearing them returns `HUMAN_REVIEW_REQUIRED`, never approval. The report shows a grounded quote or rule trace; its division map and drill are illustrative hypotheses.

Reference rows are labelled illustrative, never benchmark data. Each submission gets an ephemeral run ID and a score from its current text. Without a key, the app labels its reviewed example and rules-only evaluator; Challenge analyses rather than replaces the text. With a key, the same routes use Responses API Structured Outputs.

## Architecture, stack, and data

The working prototype uses Next.js 16, React, TypeScript, Zod, server route handlers, browser `localStorage`, and optional OpenAI Responses API calls. Secrets never enter the client. Model requests set `store: false`.

For production I would deploy the web/API tier to Vercel and use Supabase PostgreSQL/Auth with Row Level Security. Learners could inspect their own detailed traces; managers would receive aggregate capability and minimal evidence summaries by default; reviewers would access flagged cases through a separately audited role.

The scoring request would be a persisted, idempotent state machine. Critical decisions would be typed fields scored against policy; customer prose would be rendered from validated state. Model, prompt, policy, scenario, rubric, usage, latency, and errors would be recorded. Ambiguous/high-risk results route to human review; model output never executes a credit or disciplinary action.

OpenAI currently positions GPT‑5.6 Luna for cost-sensitive, high-volume workloads and Terra for a balance of intelligence and cost; both support Responses and Structured Outputs. I would start with Luna for assistance and Terra for evaluation, then choose by labelled-set performance rather than model reputation. [OpenAI models](https://developers.openai.com/api/docs/models), [Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra)

## Deployment, cost, and reliability

The live application is deployed from GitHub to Vercel. Current CI gates run lint, typecheck, 21 unit and route tests, and a production build; I also exercised the guided happy path and an unsafe-promise path against the production URL. A production pipeline would add golden-set evaluation and an automated end-to-end smoke test. The public assessment URL stays in guided mode so anonymous visitors cannot spend model quota; live-model mode needs access control and rate limits. The health endpoint exposes service state but no secret. Rollback would use the previous Vercel deployment plus version-pinned prompts and policies.

Using current public pricing and deliberately conservative token assumptions:

| Component | Assumption | Estimated cost |
|---|---:|---:|
| Luna assistance | 20k input + 5k output | $0.010 |
| Terra evaluation | 8k input + 2k output | $0.040 |
| Total model use | one completed session | **$0.050** |

That is about $50 per 1,000 sessions, or $60 with 20% retry/headroom. These are planning assumptions; production estimates must come from recorded tokens. A production-like assessment month could use Vercel Pro ($20/month) and Supabase Pro ($25/month), approximately $45 fixed before usage and tax. [Vercel pricing](https://vercel.com/pricing), [Supabase pricing](https://supabase.com/pricing)

Implemented failure handling includes Zod input bounds, 18–22 second timeouts, one bounded SDK retry, schema validation, and a deterministic fallback. A failed model call cannot erase the artifact, and deterministic gates still return useful feedback. Production adds durable idempotency, a background queue, rate limits, DLP/redaction, retention controls, tenant isolation tests, alerting, and an appeal path.

## How I would know it works

There are two separate validation questions.

**Does the evaluator work?** Before an employee pilot, I would create 24 SME-labelled traces: eight strong, eight borderline, and eight poor/adversarial. Two humans would score independently and resolve a consensus set. Release gates would be 100% schema validity, zero false passes for critical violations in the gold set, and at least 0.70 model–human rank correlation, reported with the sample size and failure cases. Every prompt/model change would rerun the same set.

**Does the product improve work?** I would pilot one workflow with randomised case-to-arm mapping, measure quality, critical-error rate, rework, completion time, and total execution cost, then repeat an unseen matched task after one or two weeks. The first customer decision is whether the evidence changes the workflow and produces a training action—not whether a tiny pilot reaches statistical significance. Course completion and engagement are supporting metrics, not proof of capability.

The current prototype passes 21 automated tests covering the happy path, contradiction stuffing, unexpected numeric claims, unsafe promises, review bypass, confidential-RCA leakage, channel omission, safe variants, timing spoof resistance, gold isolation, and guided no-key behaviour. Lint, typecheck, and production build pass. Chromium verification covers the guided happy path, unsafe-promise failure path, report restoration after reload, a 390 px layout without horizontal overflow, and a zero-error console. This verifies code behaviour, not general semantic safety, SME calibration, or outcome validity.

## What is genuinely novel

None of the individual components is novel. TAI already turns company material into training and supports role paths and evidence; Workhelix analyses task opportunity; Skillprint publicly compares human, AI, and human+AI performance; Workera provides comparable skills reassessment. [TAI LMS](https://tailabs.ai/lms), [Workhelix](https://www.workhelix.com/platform), [Skillprint](https://www.skillprint.co/), [Workera](https://www.workera.ai/solutions/ai-readiness)

My bounded novelty claim is the closed-loop combination:

> import a specific enterprise workflow → run step-level matched human/AI experiments → learn explicit division-of-labour and control rules → convert observed weak steps directly into targeted training and recertification.

In the public materials I reviewed as of 12 September 2026, I did not find one product documenting that complete loop. This is a dated market-scan conclusion, not a claim that every component is new, that no private roadmap overlaps it, or a patent-level freedom-to-operate opinion.

## Known limitations and next step

RoleLab Lite covers one role, one policy, one current artifact, and two illustrative reference rows. Its storage is browser-only; its rules are case-specific; and its score is not a validated employment assessment. It has not proved accessibility, data residency, multi-tenant security, bias performance, durable transfer, or financial ROI.

The next step is not more UI. It is a design-partner pilot with one support team: collect real but redacted artifacts, have subject-matter experts author and label matched cases, randomise the three arms, audit every critical miss, and decide whether the resulting division map changes both the operating procedure and Tai training assignment.
