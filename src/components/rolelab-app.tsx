"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  FlaskConical,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ASSISTED_CASE,
  DIVISION_MAP,
  EvaluationResult,
  POLICY,
  SEEDED_ARMS,
  TRAINING_DRILL,
} from "@/lib/experiment";

type Stage = "brief" | "workbench" | "evidence";
type EvidenceTab = "customer" | "account" | "timeline" | "policy";

type StatusResponse = {
  configured: boolean;
  mode: string;
  assistModel: string;
  evaluatorModel: string;
};

type AssistResponse = {
  customerReply: string;
  internalNote: string;
  checks: string[];
  caution: string;
  mode: "live-ai" | "guided-demo" | "guided-fallback";
  model: string;
  action: "draft" | "challenge";
  canApply: boolean;
  warning?: string;
};

const STAGES: { id: Stage; number: string; label: string }[] = [
  { id: "brief", number: "01", label: "Experiment brief" },
  { id: "workbench", number: "02", label: "Assisted run" },
  { id: "evidence", number: "03", label: "Evidence report" },
];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 3 : 0,
  }).format(value);

function Wordmark() {
  return (
    <div className="wordmark" aria-label="RoleLab">
      <span className="wordmark-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>RoleLab</span>
    </div>
  );
}

function StageRail({
  stage,
  unlocked,
  onNavigate,
}: {
  stage: Stage;
  unlocked: number;
  onNavigate: (next: Stage) => void;
}) {
  return (
    <nav className="stage-rail" aria-label="Experiment progress">
      {STAGES.map((item, index) => {
        const reached = index <= unlocked;
        return (
          <button
            type="button"
            key={item.id}
            className={`stage-link ${item.id === stage ? "is-active" : ""}`}
            onClick={() => reached && onNavigate(item.id)}
            disabled={!reached}
            aria-current={item.id === stage ? "step" : undefined}
          >
            <span>{item.number}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function AppAside({
  stage,
  unlocked,
  onNavigate,
}: {
  stage: Stage;
  unlocked: number;
  onNavigate: (next: Stage) => void;
}) {
  return (
    <aside className="app-aside">
      <Wordmark />
      <div className="aside-project">
        <p className="eyebrow">PROTOTYPE STUDY</p>
        <p>Support credit decision</p>
        <span>EXP-03 · v1.3</span>
      </div>
      <StageRail stage={stage} unlocked={unlocked} onNavigate={onNavigate} />
      <div className="aside-foot">
        <div className="synthetic-lockup">
          <ShieldCheck size={15} strokeWidth={1.8} />
          <span>Synthetic data only</span>
        </div>
        <p>One current artifact + two illustrative reference rows—not causal evidence.</p>
      </div>
    </aside>
  );
}

function Topbar({
  status,
  stage,
  timer,
}: {
  status: StatusResponse | null;
  stage: Stage;
  timer: number;
}) {
  return (
    <header className="topbar">
      <div>
        <span className="mobile-brand">RoleLab</span>
        <span className="topbar-context">TAI LABS ASSESSMENT · PROTOTYPE</span>
      </div>
      <div className="topbar-meta">
        {stage === "workbench" && (
          <span className="timer" aria-label={`Elapsed time ${formatTime(timer)}`}>
            <Clock3 size={14} /> {formatTime(timer)}
          </span>
        )}
        <span className={`mode-badge ${status?.configured ? "is-live" : ""}`}>
          <span className="status-dot" />
          {status?.mode ?? "Checking evaluator"}
        </span>
      </div>
    </header>
  );
}

function BriefScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="screen brief-screen enter-screen">
      <div className="brief-lead">
        <p className="eyebrow">ROLELAB LITE / WORKFLOW EXPERIMENT</p>
        <h1>Decide where AI belongs in the workflow.</h1>
        <p className="deck">
          Review one policy-bounded artifact against two illustrative reference rows,
          then inspect the proposed division-of-labour rule.
        </p>
        <div className="brief-actions">
          <button type="button" className="primary-button" onClick={onStart}>
            Run the assisted arm <ArrowRight size={17} />
          </button>
          <span>No sign-up · about 90 seconds</span>
        </div>
      </div>

      <div className="decision-strip">
        <div>
          <span className="eyebrow">DECISION TO MAKE</span>
          <strong>Which steps should be AI-first, human+AI, or human-owned?</strong>
        </div>
        <FlaskConical size={25} strokeWidth={1.5} />
      </div>

      <div className="experiment-spec">
        <div className="section-heading">
          <span>Pilot comparison design</span>
          <span>SOP-SLA-1.3 · n=1 demo</span>
        </div>
        <div className="arm-row arm-header">
          <span>Condition</span>
          <span>Case</span>
          <span>State</span>
          <span>What is observed</span>
        </div>
        <div className="arm-row">
          <span className="arm-name"><span className="arm-index">A</span>Human only</span>
          <span>H01 · EmberCRM</span>
          <span className="state-complete"><Check size={14} /> Illustrative</span>
          <span>Reference observation; artifact not included</span>
        </div>
        <div className="arm-row">
          <span className="arm-name"><span className="arm-index">B</span>AI only</span>
          <span>A01 · Meridian Pay</span>
          <span className="state-complete"><Check size={14} /> Illustrative</span>
          <span>Reference observation; artifact not included</span>
        </div>
        <div className="arm-row is-current">
          <span className="arm-name"><span className="arm-index">C</span>Current assisted demo</span>
          <span>C01 · Harbor Analytics</span>
          <span className="state-ready">Ready</span>
          <span>Current artifact with optional assistance</span>
        </div>
      </div>

      <div className="method-notes">
        <div>
          <span className="note-number">01</span>
          <p><strong>Illustrative references.</strong> The two seeded rows show the intended comparison schema; no underlying control artifacts are claimed.</p>
        </div>
        <div>
          <span className="note-number">02</span>
          <p><strong>Blind scoring.</strong> The evaluator receives the artifact and evidence, never the arm label.</p>
        </div>
        <div>
          <span className="note-number">03</span>
          <p><strong>Safety before score.</strong> Any failed critical gate makes the artifact not deployable and caps the score at 59.</p>
        </div>
      </div>
    </section>
  );
}

function EvidencePanel({ tab, onTab }: { tab: EvidenceTab; onTab: (tab: EvidenceTab) => void }) {
  const tabs: { id: EvidenceTab; label: string }[] = [
    { id: "customer", label: "Request" },
    { id: "account", label: "Account" },
    { id: "timeline", label: "Timeline" },
    { id: "policy", label: "Policy" },
  ];

  return (
    <section className="evidence-panel" aria-label="Case evidence">
      <div className="panel-kicker">
        <span>Evidence pack</span>
        <span>4 sources</span>
      </div>
      <div className="evidence-tabs" role="tablist" aria-label="Evidence sources">
        {tabs.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            key={item.id}
            onClick={() => onTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="evidence-body" role="tabpanel">
        {tab === "customer" && (
          <div className="source-enter">
            <p className="source-label">CUSTOMER EMAIL · PRIYA SHAH</p>
            <blockquote>“{ASSISTED_CASE.customerMessage}”</blockquote>
            <dl className="source-facts">
              <div><dt>Requested minutes</dt><dd>{ASSISTED_CASE.reportedDowntime}</dd></div>
              <div><dt>Claim received</dt><dd>{ASSISTED_CASE.claimDate}</dd></div>
              <div className="risk-fact"><dt>Risk signal</dt><dd>Possible duplicate records</dd></div>
            </dl>
          </div>
        )}
        {tab === "account" && (
          <div className="source-enter">
            <p className="source-label">CRM SNAPSHOT · 13 AUG 2026</p>
            <dl className="source-facts source-facts-wide">
              <div><dt>Account</dt><dd>{ASSISTED_CASE.account}</dd></div>
              <div><dt>Plan</dt><dd>{ASSISTED_CASE.plan}</dd></div>
              <div><dt>Standing</dt><dd>Current</dd></div>
              <div><dt>Invoice total</dt><dd>{formatMoney(ASSISTED_CASE.invoiceTotal)}</dd></div>
              <div><dt>Platform fee</dt><dd>{formatMoney(ASSISTED_CASE.eligiblePlatformFee)}</dd></div>
              <div><dt>Implementation</dt><dd>{formatMoney(ASSISTED_CASE.excludedImplementationFee)} · excluded</dd></div>
            </dl>
          </div>
        )}
        {tab === "timeline" && (
          <div className="source-enter">
            <p className="source-label">INCIDENT {ASSISTED_CASE.incidentId}</p>
            <div className="timeline-list">
              {ASSISTED_CASE.segments.map((segment) => (
                <div key={segment.cause}>
                  <span className={`timeline-dot ${segment.eligible ? "is-eligible" : ""}`} />
                  <div>
                    <strong>{segment.minutes} min · {segment.eligible ? "provider" : "customer"}</strong>
                    <p>{segment.cause}</p>
                    <small>{segment.source} · {segment.eligible ? "candidate eligible" : "exclude"}</small>
                  </div>
                  <span className={segment.eligible ? "include-chip" : "exclude-chip"}>{segment.eligible ? "Include" : "Exclude"}</span>
                </div>
              ))}
            </div>
            <div className="timeline-total">
              <span>Customer total</span><strong>99 min</strong>
              <span>Eligible candidate</span><strong>75 min</strong>
            </div>
          </div>
        )}
        {tab === "policy" && (
          <div className="source-enter policy-source">
            <p className="source-label">{POLICY.id} · PUBLISHED POLICY</p>
            {POLICY.sections.map((section) => (
              <details key={section.id} open={section.id === "03" || section.id === "04"}>
                <summary><span>{section.id}</span>{section.title}</summary>
                <p>{section.body}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Composer({
  customerReply,
  internalNote,
  onCustomerReply,
  onInternalNote,
}: {
  customerReply: string;
  internalNote: string;
  onCustomerReply: (value: string) => void;
  onInternalNote: (value: string) => void;
}) {
  return (
    <section className="composer-panel" aria-label="Work artifact">
      <div className="panel-kicker">
        <span>Work artifact</span>
        <span>{customerReply.length + internalNote.length} chars</span>
      </div>
      <label htmlFor="customer-reply">
        <span>Customer reply</span>
        <span>Visible externally</span>
      </label>
      <textarea
        id="customer-reply"
        value={customerReply}
        onChange={(event) => onCustomerReply(event.target.value)}
        placeholder="State what is known, what is calculated, and what still needs human approval."
        spellCheck
      />
      <label htmlFor="internal-note">
        <span>Decision trace</span>
        <span>Internal only</span>
      </label>
      <textarea
        id="internal-note"
        className="note-textarea"
        value={internalNote}
        onChange={(event) => onInternalNote(event.target.value)}
        placeholder="Record eligibility, exclusions, calculation inputs, risk trigger, owner, and next action."
        spellCheck
      />
    </section>
  );
}

function CopilotPanel({
  assistant,
  loading,
  configured,
  onAsk,
  onApply,
}: {
  assistant: AssistResponse | null;
  loading: boolean;
  configured: boolean;
  onAsk: (action: "draft" | "challenge") => void;
  onApply: () => void;
}) {
  return (
    <aside className="copilot-panel" aria-label="AI sidecar">
      <div className="copilot-heading">
        <div><Sparkles size={16} /><span>Evidence copilot</span></div>
        <span className="copilot-state">bounded</span>
      </div>
      {!assistant ? (
        <div className="copilot-empty">
          <p>
            The sidecar can draft from these four sources. It cannot approve the
            credit or resolve the data-integrity signal.
          </p>
          <button type="button" className="secondary-button full-button" onClick={() => onAsk("draft")} disabled={loading}>
            {loading ? "Checking evidence…" : configured ? "Draft from evidence" : "Load reviewed example"}
            {!loading && <ChevronRight size={16} />}
          </button>
          <button type="button" className="text-button" onClick={() => onAsk("challenge")} disabled={loading}>
            Challenge my current work
          </button>
          <div className="copilot-rule">
            <ShieldCheck size={15} />
            <span>Response object storage is off (store:false); provider retention policy still applies.</span>
          </div>
        </div>
      ) : (
        <div className="copilot-result source-enter">
          <div className="copilot-mode">
            <span>
              {assistant.mode === "live-ai"
                ? "Live suggestion"
                : assistant.action === "challenge"
                  ? "Deterministic challenge"
                  : "Reviewed example"}
            </span>
            <small>{assistant.model}</small>
          </div>
          <p className="copilot-summary">{assistant.action === "challenge" ? "Challenge findings" : "Proposed trace"}</p>
          <ul>
            {assistant.checks.map((check) => (
              <li key={check}><Check size={14} /> <span>{check}</span></li>
            ))}
          </ul>
          <div className="caution-note">
            <CircleAlert size={15} />
            <span>{assistant.caution}</span>
          </div>
          {assistant.warning && <p className="inline-warning">{assistant.warning}</p>}
          {assistant.canApply && (
            <button type="button" className="primary-button full-button" onClick={onApply}>
              Apply suggestion <ArrowRight size={16} />
            </button>
          )}
          <button type="button" className="text-button" onClick={() => onAsk(assistant.action === "challenge" ? "draft" : "challenge")}>
            {assistant.action === "challenge"
              ? configured ? "Request a live draft" : "Load reviewed example"
              : "Challenge my current work"}
          </button>
        </div>
      )}
    </aside>
  );
}

function WorkbenchScreen({
  customerReply,
  internalNote,
  onCustomerReply,
  onInternalNote,
  assistant,
  assistantLoading,
  configured,
  onAsk,
  onApply,
  onSubmit,
  submitting,
  error,
}: {
  customerReply: string;
  internalNote: string;
  onCustomerReply: (value: string) => void;
  onInternalNote: (value: string) => void;
  assistant: AssistResponse | null;
  assistantLoading: boolean;
  configured: boolean;
  onAsk: (action: "draft" | "challenge") => void;
  onApply: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}) {
  const [tab, setTab] = useState<EvidenceTab>("customer");

  return (
    <section className="screen workbench-screen enter-screen">
      <div className="workbench-title">
        <div>
          <p className="eyebrow">ASSISTED ARM C01 · HARBOR ANALYTICS</p>
          <h1>Make a safe credit decision.</h1>
        </div>
        <div className="task-brief">
          <span>Your output</span>
          <p>Customer reply + auditable decision trace</p>
        </div>
      </div>
      <div className="workbench-grid">
        <EvidencePanel tab={tab} onTab={setTab} />
        <Composer
          customerReply={customerReply}
          internalNote={internalNote}
          onCustomerReply={onCustomerReply}
          onInternalNote={onInternalNote}
        />
        <CopilotPanel
          assistant={assistant}
          loading={assistantLoading}
          configured={configured}
          onAsk={onAsk}
          onApply={onApply}
        />
      </div>
      <div className="submit-bar">
        <div>
          {error ? (
            <p className="form-error" role="alert"><CircleAlert size={15} /> {error}</p>
          ) : (
            <p><ShieldCheck size={15} /> 5 critical gates run before scoring; a blinded model judge is optional.</p>
          )}
        </div>
        <button type="button" className="primary-button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Running evaluator…" : "Submit evidence"}
          {!submitting && <ArrowRight size={17} />}
        </button>
      </div>
    </section>
  );
}

function ComparisonTable({ result }: { result: EvaluationResult }) {
  const currentArm = {
    id: "human-ai",
    label: "Current run",
    caseId: "C01 · Harbor Analytics",
    status: result.status,
    score: result.score,
    time: formatTime(result.durationSeconds),
    modelCost: 0,
    humanCost: (result.durationSeconds / 3600) * 60,
  };
  const arms = [...SEEDED_ARMS, currentArm];

  return (
    <div className="comparison-table">
      <div className="comparison-row comparison-header">
        <span>Condition</span><span>Quality</span><span>Time</span><span>Illustrative cost proxy*</span><span>Assessment status</span>
      </div>
      {arms.map((arm) => (
        <div className={`comparison-row ${arm.id === "human-ai" ? "is-highlighted" : ""}`} key={arm.id}>
          <div className="comparison-name">
            <strong>{arm.label}</strong>
            <small>{arm.caseId}</small>
          </div>
          <div className="score-cell">
            <strong>{arm.score}</strong>
            <span className="score-track"><span style={{ width: `${arm.score}%` }} /></span>
          </div>
          <span>{arm.time}</span>
          <span>{formatMoney(arm.modelCost + arm.humanCost)}</span>
          <span className={arm.status === "Not deployable" ? "not-deployable" : "deployable"}>{arm.status}</span>
        </div>
      ))}
      <p className="table-footnote">* Illustrative only. Seeded references include stated model cost; the current run prices browser-observed review time at $60/hour and excludes optional model-token cost.</p>
    </div>
  );
}

function Gates({ result }: { result: EvaluationResult }) {
  return (
    <div className="gate-list">
      {result.gates.map((gate) => (
        <div className={`gate-item ${gate.status === "pass" ? "is-pass" : "is-fail"}`} key={gate.id}>
          <span className="gate-id">{gate.id}</span>
          <div>
            <strong>{gate.label}</strong>
            <p>{gate.evidence}</p>
          </div>
          <span className="gate-state">{gate.status === "pass" ? <Check size={15} /> : <CircleAlert size={15} />}{gate.status}</span>
        </div>
      ))}
    </div>
  );
}

function DivisionMap() {
  return (
    <div className="division-map">
      <div className="division-legend">
        <span><i className="legend-dot ai" />AI-first</span>
        <span><i className="legend-dot hybrid" />Human + AI</span>
        <span><i className="legend-dot human" />Human-owned</span>
      </div>
      {DIVISION_MAP.map((row) => {
        const ownerClass = row.owner === "AI-first" ? "ai" : row.owner === "Human + AI" ? "hybrid" : "human";
        return (
          <div className="division-row" key={row.step}>
            <strong>{row.step}</strong>
            <span className={`ownership ${ownerClass}`}>{row.owner}</span>
            <p>{row.evidence}</p>
          </div>
        );
      })}
    </div>
  );
}

function ResultsScreen({ result, onReset }: { result: EvaluationResult; onReset: () => void }) {
  const failedGates = result.gates.filter((gate) => gate.status === "fail");
  const passedGateCount = result.gates.length - failedGates.length;
  const checksPassed = result.status === "Human review required";
  const failureSummary = failedGates.length
    ? `${failedGates.map((gate) => gate.label).join(", ")} failed. Repair the artifact before drawing any workflow conclusion from this run.`
    : "All critical gates passed, but the rubric score is below the 90-point quality threshold. Improve the artifact before deployment.";

  return (
    <section className="screen results-screen enter-screen">
      <div className="results-lead">
        <div>
          <p className="eyebrow">EVIDENCE REPORT · {result.runId}</p>
          <h1>{checksPassed ? "Keep the commitment human-owned." : "This artifact is not safe to deploy."}</h1>
          <p className="deck">
            {checksPassed
              ? "The current artifact clears the case-specific automated checks. Named human sign-off is still required before any customer commitment."
              : failureSummary}
          </p>
        </div>
        <div className={`result-score ${result.status === "Human review required" ? "is-good" : "is-risk"}`}>
          <span>Current score</span>
          <strong>{result.score}<small>/100</small></strong>
          <p>{result.status}</p>
        </div>
      </div>

      <div className="policy-banner">
        <FileCheck2 size={20} />
        <div>
          <strong>Policy checks · {passedGateCount}/{result.gates.length} passed</strong>
          <p>These checks cover supported case patterns only and never replace named sign-off. The comparison is not causal evidence or employee certification.</p>
        </div>
        <span>
          {result.mode === "live-ai"
            ? result.model
            : result.mode === "rules-fallback"
              ? "Rules fallback"
              : "Rules-only demo"}
        </span>
      </div>

      {result.warning && <div className="result-warning"><CircleAlert size={16} /> {result.warning}</div>}

      <section className="report-section">
        <div className="report-heading">
          <div><span>01</span><h2>Reference-arm readout</h2></div>
          <p>The first two rows are illustrative seeded data. Only the current row is calculated from your submitted artifact.</p>
        </div>
        <ComparisonTable result={result} />
      </section>

      <section className="report-section">
        <div className="report-heading">
          <div><span>02</span><h2>Critical policy gates</h2></div>
          <p>Any critical-gate failure caps the score at 59 and marks the artifact not deployable.</p>
        </div>
        <Gates result={result} />
      </section>

      <section className="report-section">
        <div className="report-heading">
          <div><span>03</span><h2>Rubric with evidence</h2></div>
          <p>Scores stay inspectable: dimension, grounded quote or rule trace, and next action.</p>
        </div>
        <div className="rubric-table">
          {result.dimensions.map((dimension) => (
            <div className="rubric-row" key={dimension.id}>
              <div><strong>{dimension.label}</strong><small>{dimension.score} / {dimension.max}</small></div>
              <blockquote>{dimension.evidence}</blockquote>
              <p>{dimension.note}</p>
            </div>
          ))}
        </div>
        <div className="priority-note">
          <span>Priority next action</span>
          <strong>{result.priority}</strong>
        </div>
      </section>

      <section className="report-section">
        <div className="report-heading">
          <div><span>04</span><h2>Seeded pilot recommendation</h2></div>
          <p>{checksPassed ? "This illustrative step-level routing is the hypothesis to validate in a real matched pilot." : "This mapping comes from illustrative references only; the failed current artifact contributes no workflow rule."}</p>
        </div>
        <DivisionMap />
      </section>

      <section className="report-section drill-section">
        <div className="report-heading">
          <div><span>05</span><h2>Example follow-up drill</h2></div>
          <p>An illustrative seeded AI-only failure pattern becomes a five-minute training task.</p>
        </div>
        <div className="drill-layout">
          <div>
            <p className="eyebrow">{TRAINING_DRILL.id}</p>
            <h3>{TRAINING_DRILL.title}</h3>
            <p>{TRAINING_DRILL.description}</p>
          </div>
          <dl>
            <div><dt>Pass rule</dt><dd>{TRAINING_DRILL.success}</dd></div>
            <div><dt>Seeded from</dt><dd>{TRAINING_DRILL.why}</dd></div>
          </dl>
        </div>
      </section>

      <footer className="report-footer">
        <div>
          <span>{POLICY.id}</span>
          <span>{result.promptVersion}</span>
          <span>{result.model}</span>
          <span>{formatTime(result.durationSeconds)} browser-observed</span>
        </div>
        <button type="button" className="secondary-button" onClick={onReset}><RotateCcw size={16} /> Reset experiment</button>
      </footer>
    </section>
  );
}

export default function RoleLabApp() {
  const [stage, setStage] = useState<Stage>("brief");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [customerReply, setCustomerReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [assistant, setAssistant] = useState<AssistResponse | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetch("/api/status")
      .then((response) => response.json())
      .then(setStatus)
      .catch(() =>
        setStatus({
          configured: false,
          mode: "Guided demo mode",
          assistModel: "Reviewed fallback",
          evaluatorModel: "Deterministic policy evaluator",
        }),
      );
  }, []);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("rolelab-last-run");
        if (!saved) return;
        const parsed = JSON.parse(saved) as {
          result?: EvaluationResult;
          customerReply?: string;
          internalNote?: string;
        };
        if (
          parsed.result?.runId &&
          Array.isArray(parsed.result.gates) &&
          typeof parsed.customerReply === "string" &&
          typeof parsed.internalNote === "string"
        ) {
          setResult(parsed.result);
          setCustomerReply(parsed.customerReply);
          setInternalNote(parsed.internalNote);
          setStage("evidence");
        }
      } catch {
        window.localStorage.removeItem("rolelab-last-run");
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (stage !== "workbench" || !startedAt) return;
    const update = () => setTimer(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [stage, startedAt]);

  const durationSeconds = Math.max(1, timer);

  const start = () => {
    setStage("workbench");
    setStartedAt(Date.now());
    setTimer(0);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const askAssistant = async (action: "draft" | "challenge") => {
    setAssistantLoading(true);
    setError("");
    try {
      const response = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, customerReply, internalNote }),
      });
      if (!response.ok) throw new Error("The copilot could not read the evidence pack.");
      setAssistant(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The copilot is unavailable.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const applyAssistant = () => {
    if (!assistant) return;
    setCustomerReply(assistant.customerReply);
    setInternalNote(assistant.internalNote);
    setError("");
  };

  const submit = async () => {
    if (customerReply.trim().length < 20 || internalNote.trim().length < 20) {
      setError("Add both a customer reply and an internal decision trace before scoring.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerReply, internalNote, durationSeconds }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The evaluator could not score this artifact.");
      setResult(payload);
      window.localStorage.setItem(
        "rolelab-last-run",
        JSON.stringify({ result: payload, customerReply, internalNote }),
      );
      setStage("evidence");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The evaluator is unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStage("brief");
    setCustomerReply("");
    setInternalNote("");
    setAssistant(null);
    setResult(null);
    setStartedAt(null);
    setTimer(0);
    setError("");
    window.localStorage.removeItem("rolelab-last-run");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = (next: Stage) => {
    if (next === "evidence" && !result) return;
    if (next === "workbench" && !startedAt) start();
    else setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const unlocked = result ? 2 : startedAt ? 1 : 0;

  return (
    <div className="app-shell">
      <AppAside stage={stage} unlocked={unlocked} onNavigate={navigate} />
      <main className="app-main">
        <Topbar status={status} stage={stage} timer={timer} />
        {stage === "brief" && <BriefScreen onStart={start} />}
        {stage === "workbench" && (
          <WorkbenchScreen
            customerReply={customerReply}
            internalNote={internalNote}
            onCustomerReply={setCustomerReply}
            onInternalNote={setInternalNote}
            assistant={assistant}
            assistantLoading={assistantLoading}
            configured={status?.configured ?? false}
            onAsk={askAssistant}
            onApply={applyAssistant}
            onSubmit={submit}
            submitting={submitting}
            error={error}
          />
        )}
        {stage === "evidence" && result && <ResultsScreen result={result} onReset={reset} />}
      </main>
    </div>
  );
}
