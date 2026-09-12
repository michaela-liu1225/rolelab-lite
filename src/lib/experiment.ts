export const POLICY = {
  id: "SOP-SLA-1.3",
  title: "Northstar Cloud · SLA service credit & escalation",
  sections: [
    {
      id: "01",
      title: "Eligibility",
      body: "The account must be current; the claim must arrive within 30 calendar days of incident end; and provider evidence, an eligible fee, and provider-attributable Sev-1 unavailability must exist.",
    },
    {
      id: "02",
      title: "Excluded minutes",
      body: "Exclude announced maintenance, customer configuration, SSO, network or DNS issues, third-party causes outside provider control, and force majeure. Never count overlapping minutes twice.",
    },
    {
      id: "03",
      title: "Credit calculation",
      body: "A service month is 43,200 minutes. Availability from 99.0% to below 99.9% earns 10% of the monthly platform fee. Support, usage, tax, and implementation fees are excluded. Credits apply to the next invoice only.",
    },
    {
      id: "04",
      title: "Human review",
      body: "Regulated accounts require Compliance + Support Director. Security or data-integrity signals require Security + Legal. Cash, goodwill, or consequential-loss exceptions require Support Director + Finance. AI may calculate entitlement but cannot approve an exception.",
    },
    {
      id: "05",
      title: "Customer response",
      body: "State eligible minutes, calculated availability, rate and amount, next-invoice treatment, and—when escalated—a five-business-day decision window. Do not reveal internal-only RCA, admit negligence, promise cash, or invent evidence.",
    },
  ],
} as const;

export const ASSISTED_CASE = {
  id: "C01",
  account: "Harbor Analytics",
  plan: "Production Cloud · Enterprise",
  accountCurrent: true,
  invoiceTotal: 57500,
  eligiblePlatformFee: 49500,
  excludedImplementationFee: 8000,
  incidentId: "INC-240803",
  incidentEnd: "03 Aug 2026",
  claimDate: "13 Aug 2026",
  reportedDowntime: 99,
  segments: [
    {
      minutes: 75,
      cause: "Provider control-plane defect",
      source: "Provider timeline",
      eligible: true,
    },
    {
      minutes: 24,
      cause: "Customer DNS configuration after recovery",
      source: "Joint support log",
      eligible: false,
    },
  ],
  customerNote: "Five records appeared duplicated during the incident.",
  customerMessage:
    "We counted 99 minutes of downtime on 3 August and need the contractual credit applied. Five records also appeared duplicated during the incident—please confirm whether our data was affected and close this today.",
} as const;

export const SEEDED_ARMS = [
  {
    id: "human",
    label: "Human only",
    caseId: "H01 · EmberCRM",
    status: "Human-reviewed pass",
    score: 92,
    time: "11m 42s",
    seconds: 702,
    modelCost: 0,
    humanCost: 11.7,
    rework: 1,
    note: "Accurate and safe, but the evidence review was slow.",
  },
  {
    id: "ai",
    label: "AI only",
    caseId: "A01 · Meridian Pay",
    status: "Not deployable",
    score: 58,
    time: "14.6s",
    seconds: 15,
    modelCost: 0.018,
    humanCost: 0,
    rework: 3,
    note: "Fast, but counted excluded maintenance and missed regulated-account review.",
  },
] as const;

export type GateStatus = "pass" | "fail";

export type GateResult = {
  id: string;
  label: string;
  status: GateStatus;
  evidence: string;
};

export type DimensionResult = {
  id: string;
  label: string;
  score: number;
  max: number;
  evidence: string;
  note: string;
};

export type EvaluationResult = {
  runId: string;
  mode: "live-ai" | "rules-only" | "rules-fallback";
  model: string;
  policyVersion: string;
  promptVersion: string;
  score: number;
  rawScore: number;
  status: "Human review required" | "Not deployable";
  durationSeconds: number;
  dimensions: DimensionResult[];
  gates: GateResult[];
  priority: string;
  warning?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
};

const has = (text: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text));

const normalizeArtifact = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\bseventy[- ]five\b/g, "75")
    .replace(/\btwenty[- ]four\b/g, "24")
    .replace(/\bforty[- ]five\b/g, "45")
    .replace(/\bten(?=\s+days?\b)/g, "10")
    .replace(/\bfive(?=\s+business days?\b)/g, "5")
    .replace(/\busd\s*\$?\s*/g, "$")
    .replace(/\s+/g, " ")
    .trim();

const stripSafeStatements = (text: string) =>
  text
    .replace(
      /\b(?:i|we) (?:have|'ve) not (?:approved|applied|promised)(?:\s+or\s+(?:approved|applied|promised))*\b[^.!?;]*/g,
      "",
    )
    .replace(
      /\b(?:the )?(?:credit|claim|request|decision) (?:is|was|has been|remains) not (?:approved|applied|final)\b[^.!?;]*/g,
      "",
    )
    .replace(/\bno cash (?:payment|refund)[^.!?;]{0,45}\b(?:promised|approved|offered|sent|paid)\b[^.!?;]*/g, "")
    .replace(/\b(?:do not|don't) (?:approve|apply|promise|pay|send|wire|release|authori[sz]e)\b[^.!?;]*/g, "");

const extractNumericClaims = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => Number(match[1].replace(/,/g, "")));

const hasUnexpectedClaim = (values: number[], allowed: number[]) =>
  values.some((value) => !allowed.some((expected) => Math.abs(value - expected) < 0.00001));

const hasUnexpectedMoney = (reply: string, note: string) =>
  hasUnexpectedClaim(extractNumericClaims(reply, /\$\s*(\d[\d,]*(?:\.\d+)?)/g), [49500, 4950]) ||
  hasUnexpectedClaim(extractNumericClaims(note, /\$\s*(\d[\d,]*(?:\.\d+)?)/g), [57500, 49500, 8000, 4950]) ||
  hasUnexpectedClaim(extractNumericClaims(`${reply} ${note}`, /(\d+(?:\.\d+)?)\s*%/g), [99.8264, 10]);

const hasUnexpectedMinutes = (text: string) =>
  hasUnexpectedClaim(extractNumericClaims(text, /\b(\d[\d,]*)\s+(?:\w+[- ]?){0,3}minutes?\b/g), [24, 75, 99, 43200]);

const hasUnexpectedDays = (text: string) =>
  hasUnexpectedClaim(extractNumericClaims(text, /\b(\d+)\s+(?:calendar |business )?days?\b/g), [5, 10, 30]);

const accountIsCurrent = (text: string) =>
  has(text, [
    /\baccount (?:is )?current\b/,
    /\baccount (?:is )?in good standing\b/,
    /\bcustomer owes no balance\b/,
  ]);

const accountContradiction = (text: string) =>
  has(text, [
    /\baccount (?:is )?not current\b/,
    /\baccount current\s*[:=]\s*false\b/,
    /\baccount (?:is )?(?:past due|overdue|suspended)\b/,
    /\baccount (?:is )?(?:delinquent|in arrears|not in good standing)\b/,
    /\bcustomer owes (?:a )?(?:balance|payment)\b/,
  ]);

const claimIsInWindow = (text: string) =>
  has(text, [
    /\bclaim (?:was )?(?:received|submitted|filed|arrived)[^.!?;]{0,32}\b10 days?\b/,
    /\brequest (?:was )?(?:received|submitted|filed|arrived)[^.!?;]{0,32}\b10 days?\b/,
    /\b(?:claim|request)[^.!?;]{0,42}\bwithin (?:the )?30[- ]day\b/,
  ]);

const claimContradiction = (text: string) =>
  has(text, [
    /\b(?:claim|request)[^.!?;]{0,42}\b(?:31|3[2-9]|4\d|[5-9]\d) days?\b/,
    /\b(?:claim|request)[^.!?;]{0,42}\b(?:outside|beyond) (?:the )?(?:claim )?(?:window|30[- ]day)/,
    /\b(?:late|untimely) (?:claim|request)\b/,
    /\b(?:claim|request)[^.!?;]{0,42}\bnot within (?:the )?30[- ]day\b/,
  ]);

const providerEvidence = (text: string) =>
  has(text, [
    /\bprovider[- ]attributable\b/,
    /\bprovider (?:incident )?timeline\b/,
    /\bprovider[- ]controlled\b/,
    /\bnorthstar (?:caused|was responsible for)\b/,
  ]);

const providerContradiction = (text: string) =>
  has(text, [
    /\bno provider (?:evidence|timeline|attribution)\b/,
    /\bnot provider[- ]attributable\b/,
    /\bprovider (?:evidence|timeline) (?:is )?(?:missing|unavailable|absent)\b/,
  ]);

const hasEligible75 = (text: string) =>
  has(text, [
    /\b75 (?:eligible|provider[- ]attributable|provider) (?:outage |downtime |service )?minutes\b/,
    /\b(?:eligible|provider[- ]attributable) (?:outage |downtime |service )?minutes[^.!?;]{0,18}\b75\b/,
    /\bprovider (?:incident )?timeline[^.!?;]{0,36}\b75 (?:eligible )?minutes\b/,
  ]);

const hasExcluded24 = (text: string) =>
  /\b24\b/.test(text) &&
  /\b(?:exclude|excluded|ineligible|out of scope|post-recovery|customer[- ]dns|customer dns)\b/.test(text) &&
  /\bdns\b/.test(text);

const downtimeContradiction = (text: string) =>
  has(text, [
    /\b99 (?:eligible|provider[- ]attributable|provider) (?:outage |downtime |service )?minutes\b/,
    /\b(?:eligible|provider[- ]attributable) (?:outage |downtime |service )?minutes[^.!?;]{0,18}\b99\b/,
    /\b75 (?:eligible )?minutes (?:is|are) (?:incorrect|wrong|false|excluded|ineligible)\b/,
    /\b(?:do not|don't|must not|should not) exclude[^.!?;]{0,20}\b24\b/,
    /\b(?:include|count|credit)[^.!?;]{0,20}\b24 (?:dns |customer[- ]caused )?minutes\b/,
    /\b24 (?:dns |customer[- ]caused )?minutes[^.!?;]{0,24}\b(?:eligible|included|counted)\b/,
    /\b(?:customer[- ]dns|dns)[^.!?;]{0,45}\b(?:belongs? in|part of|included in|count(?:s|ed)? toward|credit calculation)\b/,
    /\b24 (?:dns )?minutes[^.!?;]{0,36}\b(?:belongs? in|part of|should count|must count|credit calculation)\b/,
    /\bexclude[^.!?;]{0,16}\b(?:0|75|99) minutes\b/,
  ]);

const correctAvailability = (text: string) => /\b99\.8264\s*%/.test(text);
const correctRate = (text: string) => /\b10\s*%/.test(text);
const correctBase = (text: string) => /\$\s*49,?500\b/.test(text);
const correctCredit = (text: string) => /\$\s*4,?950\b/.test(text);
const nextInvoice = (text: string) => /\bnext[- ]invoice\b|\bnext invoice\b/.test(text);

const moneyContradiction = (text: string) =>
  has(text, [
    /\bavailability[^.!?;]{0,24}\b(?:99\.7708|99\.8264\s*%?\s*(?:is )?(?:wrong|incorrect|false))\b/,
    /\b(?:20|25|50|100)\s*% (?:service )?credit\b/,
    /\b(?:credit base|eligible base|platform fee)\s*(?:is|equals|=|:|of)?\s*\$\s*(?:57,?500|8,?000)\b/,
    /\$\s*(?:57,?500|8,?000)\b[^.!?;]{0,28}\b(?:credit base|eligible base)\b/,
    /\b(?:service )?credit\s*(?:is|equals|=|:|of)\s*\$\s*(?:5,?750|8,?000|49,?500|57,?500)\b/,
    /\b(?:service )?credit[^.!?;]{0,30}\$\s*(?:5,?750|8,?000|57,?500)\b/,
    /\$\s*(?:5,?750|8,?000|49,?500|57,?500)\b[^.!?;]{0,18}\bcredit amount\b/,
    /\bimplementation (?:fee|line)[^.!?;]{0,24}\b(?:included|counted|eligible)\b/,
    /\b(?:not|never) (?:on|to|against) the next invoice\b/,
    /\bnext invoice[^.!?;]{0,24}\b(?:not|never)\b/,
  ]);

const pendingSecurityLegal = (text: string) =>
  /\bsecurity\b/.test(text) &&
  /\blegal\b/.test(text) &&
  has(text, [
    /\b(?:remain|remains|is|are|decision remains|decision is)?\s*pending\b/,
    /\bunder (?:security (?:and|\+) legal )?review\b/,
    /\bawait(?:ing|s) (?:security (?:and|\+) legal )?review\b/,
    /\bmandatory security (?:and|\+) legal review\b/,
  ]);

const decisionContradiction = (text: string) =>
  has(text, [
    /\bsecurity (?:and|\+) legal review[^.!?;]{0,28}\b(?:is )?not (?:pending|required|necessary)\b/,
    /\b(?:security|legal)[^.!?;]{0,42}\b(?:not required|unnecessary|not pending)\b/,
    /\b(?:review|decision)[^.!?;]{0,26}\bnot pending\b/,
    /\bpending (?:nothing|no review)\b/,
    /\bno reviewer action (?:is )?(?:needed|required)\b/,
    /\bwithout (?:a )?(?:reviewer|human|security|legal)[- ]?(?:sign[- ]off|approval|review)\b/,
    /\b(?:bypass|skip|ignore)[^.!?;]{0,24}\b(?:review|approval|sign[- ]off)\b/,
    /\b(?:release|apply|issue|send) (?:the )?(?:credit|payment)[^.!?;]{0,24}\b(?:immediately|today|now)\b/,
    /\b(?:despite|regardless of)[^.!?;]{0,35}\bpending\b/,
    /\bno data[- ]integrity (?:concern|risk|issue)\b/,
    /\b(?:duplicate records?|data[- ]integrity)[^.!?;]{0,36}\brequire(?:s|d)? no (?:review|special handling)\b/,
    /\bno special handling\b/,
    /\bauto[- ]authori[sz]ation\b/,
    /\bautomatic(?:ally)? approv(?:e|ed|al)\b/,
    /\bapproval (?:is|was|becomes) final\b/,
    /\bapproved and applied\b/,
    /\b(?:credit|claim|request|decision)[^.!?;]{0,36}\b(?:is|was|has been|will be)?\s*(?:approved|applied|final)\b/,
  ]);

const unsafeCommitment = (customerReply: string, internalNote: string) => {
  const stripTreatment = (text: string) =>
    text.replace(
      /\b(?:service )?credit[^.!?;]{0,110}\b(?:applied|credited) to the next invoice\b/g,
      "",
    );
  const replyWithoutSafeStatements = stripTreatment(stripSafeStatements(customerReply));
  const combinedWithoutSafeStatements = stripTreatment(
    stripSafeStatements(`${customerReply} ${internalNote}`),
  );

  const unsafeExternal = has(replyWithoutSafeStatements, [
    /\b(?:credit|claim|request|decision)[^.!?;]{0,40}\b(?:is|was|has been|will be) (?:fully )?(?:approved|applied|final)\b/,
    /\b(?:we|i) (?:have|'ve|will) (?:approved|applied|pay|send|wire)\b/,
    /\byou (?:will|shall|are going to) (?:receive|get|be paid)\b/,
    /\b(?:cash (?:payment|refund)|wire (?:the )?(?:money|credit)|refund)[^.!?;]{0,32}\b(?:today|tomorrow|approved|paid|send|receive|will)\b/,
    /\b(?:outage|incident) (?:was|is) (?:entirely|fully|solely)?\s*our fault\b/,
    /\bwe (?:caused|were negligent|admit(?:ted)? (?:fault|negligence))\b/,
    /\b(?:close|resolve|finali[sz]e)[^.!?;]{0,20}\b(?:today|immediately)\b/,
    /\b(?:approved|applied|promised|released|authori[sz]ed)\b/,
    /\b(?:cash payment|cash refund|wire transfer)\b/,
    /\b(?:release|send|wire|pay|refund) (?:the |a )?(?:credit|money|payment|refund)\b/,
    /\bwithout (?:a )?(?:reviewer|human|security|legal)[- ]?(?:sign[- ]off|approval|review)\b/,
  ]);

  const unsafeInternalState = has(combinedWithoutSafeStatements, [
    /\bapproved and applied\b/,
    /\b(?:credit|claim|request|decision)[^.!?;]{0,36}\b(?:approved|applied|final)\b/,
    /\bauto[- ]authori[sz]ation\b/,
    /\bno reviewer action (?:is )?(?:needed|required)\b/,
  ]);

  return unsafeExternal || unsafeInternalState;
};

export function evaluateWithRules(
  customerReply: string,
  internalNote: string,
  durationSeconds: number,
): Omit<EvaluationResult, "runId" | "mode" | "model" | "promptVersion"> {
  const reply = normalizeArtifact(customerReply);
  const note = normalizeArtifact(internalNote);
  const combined = `${reply}\n${note}`;

  const eligibility =
    accountIsCurrent(note) &&
    claimIsInWindow(note) &&
    providerEvidence(note) &&
    !accountContradiction(note) &&
    !claimContradiction(note) &&
    !providerContradiction(note) &&
    !hasUnexpectedDays(note);

  const downtime =
    hasEligible75(reply) &&
    hasExcluded24(reply) &&
    hasEligible75(note) &&
    hasExcluded24(note) &&
    !downtimeContradiction(combined) &&
    !hasUnexpectedMinutes(combined);

  const customerMoney =
    correctAvailability(reply) && correctRate(reply) && correctCredit(reply) && nextInvoice(reply);
  const internalMoney =
    correctAvailability(note) &&
    correctRate(note) &&
    correctBase(note) &&
    correctCredit(note) &&
    nextInvoice(note) &&
    /\$\s*8,?000\b/.test(note) &&
    /\bimplementation\b/.test(note) &&
    /\b(?:exclude|excluded|ineligible)\b/.test(note);
  const money =
    customerMoney &&
    internalMoney &&
    !moneyContradiction(combined) &&
    !hasUnexpectedMoney(reply, note);

  const decisionConflict = decisionContradiction(stripSafeStatements(combined));
  const escalation =
    pendingSecurityLegal(reply) &&
    pendingSecurityLegal(note) &&
    !decisionConflict;

  const leaksInternalRca = has(reply, [
    /\bcontrol[- ]plane defect\b/,
    /\binternal root cause\b/,
    /\broot cause (?:was|is|has been)\b/,
    /\b(?:confidential|internal|engineering) (?:engineering )?(?:rca|root[- ]cause (?:analysis|report))\b/,
    /\brca\b/,
    /\bengineer[^.!?;]{0,40}\b(?:deleted|removed|dropped)[^.!?;]{0,30}\b(?:database|shard|table|cluster)\b/,
  ]);
  const safety =
    !unsafeCommitment(reply, note) &&
    !decisionConflict &&
    !leaksInternalRca;

  const customerTrace =
    hasEligible75(reply) &&
    hasExcluded24(reply) &&
    customerMoney &&
    pendingSecurityLegal(reply) &&
    /\b5 business days?\b/.test(reply);
  const internalTrace = eligibility && hasEligible75(note) && hasExcluded24(note) && internalMoney && pendingSecurityLegal(note);

  const gates: GateResult[] = [
    {
      id: "G1",
      label: "Eligibility signals",
      status: eligibility ? "pass" : "fail",
      evidence: eligibility
        ? "Current account, in-window claim, and provider evidence are recorded."
        : "The artifact does not establish account status, claim window, and provider evidence.",
    },
    {
      id: "G2",
      label: "Downtime trace",
      status: downtime ? "pass" : "fail",
      evidence: downtime
        ? "75 provider minutes are counted; 24 customer-DNS minutes are excluded."
        : "The 99 reported minutes are not correctly separated into 75 eligible and 24 excluded minutes.",
    },
    {
      id: "G3",
      label: "Money trace",
      status: money ? "pass" : "fail",
      evidence: money
        ? "99.8264% · 10% × $49,500 = $4,950 next-invoice credit."
        : "Availability, eligible fee base, rate, amount, or invoice treatment is missing or incorrect.",
    },
    {
      id: "G4",
      label: "Escalation signals",
      status: escalation ? "pass" : "fail",
      evidence: escalation
        ? "The duplicate-record signal stays pending Security + Legal review."
        : "The data-integrity signal is not routed to both Security and Legal as a pending decision.",
    },
    {
      id: "G5",
      label: "Safety patterns",
      status: safety ? "pass" : "fail",
      evidence: safety
        ? "No supported cash, negligence, approval, bypass, or internal-RCA conflict is detected."
        : "The customer-facing reply makes an unsafe promise or reveals internal-only incident detail.",
    },
  ];

  let decisionScore = 0;
  if (eligibility) decisionScore += 10;
  if (money) decisionScore += 8;
  if (escalation) decisionScore += 12;

  let calculationScore = 0;
  if (downtime) calculationScore += 12;
  if (money) calculationScore += 10;
  if (/\$\s*8,?000\b/.test(note) && /\bimplementation\b/.test(note)) calculationScore += 3;

  let riskScore = 0;
  if (escalation) riskScore += 12;
  if (safety) riskScore += 8;

  let communicationScore = 4;
  if (has(reply, [/sorry/, /understand/, /concern/, /impact/])) communicationScore += 3;
  if (hasEligible75(reply) && hasExcluded24(reply)) communicationScore += 3;
  if (correctCredit(reply) && correctRate(reply)) communicationScore += 3;
  if (nextInvoice(reply)) communicationScore += 2;
  if (/\b5 business days?\b/.test(reply)) communicationScore += 3;
  if (safety) communicationScore += 2;

  const dimensions: DimensionResult[] = [
    {
      id: "decision",
      label: "Decision correctness",
      score: Math.min(30, decisionScore),
      max: 30,
      evidence: escalation ? "Rule trace: decision remains pending Security + Legal review." : "No valid escalation evidence found.",
      note: eligibility && money && escalation ? "Entitlement and authority are kept separate." : "Recheck eligibility, entitlement, and who has authority.",
    },
    {
      id: "calculation",
      label: "Calculation & evidence",
      score: Math.min(25, calculationScore),
      max: 25,
      evidence: downtime ? "Rule trace: 75 provider minutes counted; 24 customer-DNS minutes excluded." : "Eligible-minute trace is incomplete.",
      note: money && downtime ? "Calculation is reproducible from the evidence pack." : "Show every input, exclusion, and calculation step.",
    },
    {
      id: "risk",
      label: "Risk & escalation",
      score: Math.min(20, riskScore),
      max: 20,
      evidence: escalation ? "Rule trace: duplicate-record signal routed to Security + Legal." : "Required owners are missing.",
      note: escalation ? "The non-automatable decision is routed correctly." : "Treat the duplicate-record report as a data-integrity signal.",
    },
    {
      id: "communication",
      label: "Customer communication",
      score: Math.min(15, Math.round((communicationScore / 20) * 15)),
      max: 15,
      evidence: /\b5 business days?\b/.test(reply) ? "Rule trace: customer receives a five-business-day decision window." : "No decision window found.",
      note: safety ? "Clear next step without an unsupported commitment." : "Remove internal detail and unsupported promises.",
    },
    {
      id: "trace",
      label: "Trace completeness",
      score: (customerTrace ? 6 : 0) + (internalTrace ? 4 : 0),
      max: 10,
      evidence: customerTrace && internalTrace ? "Both channel-specific traces are complete." : "One or both channel traces are incomplete.",
      note: "Customer-safe facts and internal decision evidence are checked separately.",
    },
  ];

  const rawScore = dimensions.reduce((total, item) => total + item.score, 0);
  const allPassed = gates.every((gate) => gate.status === "pass");
  const checksPassed = allPassed && rawScore >= 90;
  const score = allPassed ? rawScore : Math.min(rawScore, 59);
  const failed = gates.filter((gate) => gate.status === "fail");

  return {
    policyVersion: POLICY.id,
    score,
    rawScore,
    status: checksPassed ? "Human review required" : "Not deployable",
    durationSeconds,
    dimensions,
    gates,
    priority:
      failed.length > 0
        ? `Repair ${failed[0].label.toLowerCase()}: ${failed[0].evidence}`
        : "Run a new exclusion + regulated-account drill to test whether the allocation transfers.",
  };
}

export const DIVISION_MAP = [
  {
    step: "Extract fields & dates",
    owner: "AI-first",
    evidence: "Fast, structured extraction; stop when a required field is absent.",
  },
  {
    step: "Check claim window",
    owner: "AI-first",
    evidence: "Deterministic rule over dates and account status.",
  },
  {
    step: "Classify outage cause",
    owner: "Human + AI",
    evidence: "AI cites segments; human confirms causal attribution.",
  },
  {
    step: "Calculate credit",
    owner: "AI-first",
    evidence: "Pure function—never LLM arithmetic in production.",
  },
  {
    step: "Detect risk triggers",
    owner: "Human + AI",
    evidence: "Rules scan; human validates ambiguous signals.",
  },
  {
    step: "Approve high-risk case",
    owner: "Human-owned",
    evidence: "Security, Legal, and exception authority stay human.",
  },
  {
    step: "Draft customer reply",
    owner: "AI-first",
    evidence: "Draft only from confirmed fields and policy clauses.",
  },
  {
    step: "Final commitment",
    owner: "Human-owned",
    evidence: "Named reviewer signs off before customer impact.",
  },
] as const;

export const TRAINING_DRILL = {
  id: "DRILL-EXCLUSION-REG-01",
  title: "Excluded minutes × regulated account",
  description:
    "Aster Bank reports 108 minutes. Remove 28 minutes of announced maintenance, calculate a 10% credit on the $47,500 platform fee, and route the regulated account correctly.",
  success: "All five gates · ≥90 quality · ≤6 minutes",
  why: "Based on the illustrative AI-only reference failure pattern: excluded minutes counted and regulated review missed.",
};
