# Tai Labs assessment research

Research cut-off: **12 September 2026**. Public product claims below are attributed to their publishers; they are not treated as independently audited results.

## Executive read

Tai Labs is not a generic early-stage “AI tutor” brief. Its public product already spans community, role-based learning, company-grounded course creation, practical assessment, certification, readiness reporting, workflow templates/building, agents, and enterprise enablement. The shared Tai Labs & Snapdrum careers site says the AI Engineer Intern builds full-stack AI software for top client projects and internal products. The likely evaluation standard is therefore: find a real enterprise decision, scope it tightly, ship a complete usable loop, and explain reliability/cost/privacy with precision. [Tai homepage](https://tailabs.ai/), [Tai LMS](https://tailabs.ai/lms), [team product](https://tailabs.ai/teams/subscribe/), [careers](https://jobs.tailabs.ai/)

The selected gap is **work allocation**, not content: after a company chooses a workflow, which steps should be AI-first, human+AI, or human-owned—and what evidence justifies that operating rule?

## Company and product

### Relationship and maturity

- The careers site presents the employer as **Tai Labs & Snapdrum** and describes the engineering internship as building both client and internal AI products. [Careers](https://jobs.tailabs.ai/)
- Tai’s team checkout says the offering is “Operated by Snapdrum.” [Team pricing](https://tailabs.ai/teams/subscribe/)
- The UK entity **SNAPDRUM LTD**, company number 16337045, is active, was incorporated on 24 March 2025, and lists IT services and education as its business activities. Its first accounts are not due until 24 December 2026, so public financial history is limited. [Companies House](https://find-and-update.company-information.service.gov.uk/company/16337045)
- This points to a young, founder-led business combining enterprise delivery with a software/education product. The assessment should look like something that can support both: a focused product primitive that is also useful in client discovery and enablement work.

### What Tai already sells publicly

| Surface | Public capability | Implication for this assessment |
|---|---|---|
| Team platform | Baseline and quarterly readiness, role paths, coach, workflow library/builder, company knowledge, course generation, certification, manager adoption dashboard | Do not pitch a generic tutor, quiz builder, workflow library, or readiness dashboard. [Source](https://tailabs.ai/teams/subscribe/) |
| LMS | Role-based tracks, graded work, certificates, capability reporting, policy-grounded training, audit trail, re-certification | “Assessment plus dashboard” is already core; the new value must change the evidence or decision. [Source](https://tailabs.ai/lms) |
| Enterprise | Identity/governance, custom standards, re-assessment cycles, analytics, rollout waves | A credible extension needs tenancy, evidence, permissions, and calibration in its production plan. [Source](https://tailabs.ai/enterprise) |
| Services | Workflow discovery, live training, implementation support, assessed projects | Workflow Scout should be framed as productising an existing service motion, not inventing discovery. [Source](https://tailabs.ai/) |
| Engineering curriculum | Applied AI architecture, evaluation, deployment, risk and production concerns | Founders are likely to notice shallow “RAG/agents” name-dropping and missing evals. [Source](https://tailabs.ai/ai-eng-syllabus) |

Tai’s own about page says its loop is Measure → Learn → Apply → Prove and explicitly rejects attendance-only credentials. RoleLab should therefore complement, rather than contradict, that positioning: its unique output is a workflow operating rule and the training action created from it. [About](https://tailabs.ai/about)

## Market scan

### What is already covered

| Product/category | Relevant public capability | Boundary for RoleLab |
|---|---|---|
| Tai Labs | Role-specific learning, workflows, assessed evidence, readiness, manager reporting, course generation | Those components are not novel. |
| Workera | Scenario-based behavioural assessments, always-on workplace signal, targeted coaching, re-measurement, aggregate-first privacy | Matched reassessment and “train the gap” are not novel. [Source](https://www.workera.ai/solutions/ai-readiness) |
| Section Coach / HQ | Personalised role coaching, use-case discovery, adoption/proficiency/ROI reporting | Coaching and impact dashboards are crowded. [Coach](https://www.sectionai.com/section-coach), [HQ](https://www.sectionai.com/section-hq) |
| Workhelix | Role/task opportunity analysis, usage data, benchmarks, savings and ROI | Task opportunity maps and ROI estimates are not novel. [Source](https://www.workhelix.com/platform) |
| Skillprint Signal | Blind human-only, AI-only, and human+AI comparison; performance/cost measurement | The three-arm experiment itself is not novel. [Source](https://www.skillprint.co/) |

### Unmet decision

The strongest remaining question is not “Can people use AI?” or “Where might AI save time?” It is:

> For this company’s actual workflow, what should the operating division of labour be, and what human controls are required at each step?

That is an important distinction because human+AI is not automatically the best condition. A systematic review and meta-analysis covering 106 experiments and 370 effect sizes found that human–AI combinations underperformed the better standalone actor on average, with material variation by task; only a small minority of studies designed explicit subtask allocation. [Nature Human Behaviour](https://www.nature.com/articles/s41562-024-02024-1)

## Ideas considered

| Idea | Customer decision | Value | Seven-day fit | Novelty risk |
|---|---|---|---:|---:|
| Workflow Scout | Which workflows deserve an experiment? | Ties enablement to operational value | High | High overlap with Tai/Workhelix |
| **RoleLab** | Which steps should AI act, assist, or stop on? | Produces evidence-based operating and training rules | **High if one workflow** | Medium; must claim the full loop only |
| Near-Miss Loop | Which real failures should become approved training? | Keeps capability work responsive to operations | Medium | Adjacent incident-to-training tools exist |
| Transfer Lab | Did learning transfer to an unseen matched case? | Better outcome evidence than completion | High | Workera already covers re-measurement |
| TeamOps Arena | Can multiple roles recover from injected AI failures? | Strong collaboration signal | Low | Too much orchestration for seven days |

RoleLab Lite was selected because it demonstrates the key customer decision in one complete interaction while supporting a careful novelty claim.

## Novelty boundary

Public examples exist for every ingredient:

- Workhelix: task opportunity and ROI;
- Skillprint: human/AI/human+AI experiments;
- Workera: behavioural assessment, workplace signal, coaching, and re-measurement;
- Tai: workflow templates, training generation, evidence, and certification.

The claim is therefore limited to the combination:

> import a specific enterprise workflow → run matched step-level human/AI conditions → learn explicit division-of-labour and control rules → convert observed weak steps into targeted training and recertification.

No reviewed public page documented that complete loop as of the research cut-off. This is a market scan, not a universal absence claim, patent search, or freedom-to-operate opinion.

## Prototype scope and evidence design

RoleLab Lite uses one synthetic B2B cloud-support credit workflow:

- one versioned SLA and escalation SOP;
- an intended three-case matched design, represented here by one current artifact and two illustrative rows;
- one excluded downtime segment and invoice line in each case;
- one mandatory human escalation trigger in each case;
- five critical gates plus a weighted rubric;
- illustrative human-only and AI-only reference data without underlying artifacts;
- one current, editable artifact with optional assistance, scored server-side;
- one illustrative step-level division map and example drill.

The conclusion is intentionally modest: this build demonstrates the proposed instrumentation and interaction, not an empirical triad or workflow effect. A real pilot would randomise case-arm assignment with a Latin square, use multiple participants/cases, blind the judge to condition, and add delayed matched testing.
