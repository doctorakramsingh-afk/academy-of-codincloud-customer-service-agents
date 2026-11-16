import { AcademyShell, SignInGate, useAcademy } from "@/components/academy/AcademyShell";
import { EmptyState, SectionHeading, StatusBadge } from "@/components/academy/ui";
import { formatDate } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Quote } from "lucide-react";
import { useMemo, useState } from "react";

type RubricItem = { key: string; label: string; max: number; observable: string };
type ScoreDraft = Record<string, { score: number; feedback: string }>;

export default function Coach() {
  return (
    <AcademyShell>
      <CoachGate />
    </AcademyShell>
  );
}

function CoachGate() {
  const { loading, authenticated, me } = useAcademy();
  if (loading) return <div className="py-24 text-center text-sm text-inkmuted">Loading the review queue…</div>;
  if (!authenticated) return <SignInGate title="Sign in to review">The review queue is reserved for coaches, interviewers and administrators.</SignInGate>;
  if (!me || !["coach", "interviewer", "admin"].includes(me.profile.role)) {
    return <EmptyState title="Review queue is role-restricted">Your Academy role is {me?.profile.role ?? "learner"}. Ask an administrator to promote you to coach to review attempts.</EmptyState>;
  }
  return <CoachInner />;
}

function CoachInner() {
  const queue = trpc.academy.attempts.reviewQueue.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const rows = queue.data ?? [];
  const selected = useMemo(() => rows.find(r => r.id === selectedId) ?? rows[0] ?? null, [rows, selectedId]);

  return (
    <div className="animate-rise">
      <SectionHeading eyebrow="Review queue" title="Human review, scoped to your cohort.">
        You see attempts from learners assigned to you by an administrator. Rubric scores are formal human assessment; AI notes appear only when the learner explicitly shared them.
      </SectionHeading>

      {queue.isLoading ? (
        <div className="py-16 text-center text-sm text-inkmuted">Loading attempts…</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No attempt to review yet">Once a learner in your seeded cohort submits an attempt, it appears here.</EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
          <div className="space-y-2">
            {rows.map(r => (
              <button key={r.id} onClick={() => setSelectedId(r.id)} className={`w-full rounded-sm border p-3 text-left transition-colors ${selected?.id === r.id ? "border-teal bg-[#e8f4f0]" : "border-line bg-card hover:border-teal/40"}`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{r.learnerName}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="line-clamp-2 text-[12px] leading-snug text-inkmuted">{r.scenario?.title ?? "Scenario"}</div>
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] uppercase tracking-[0.08em] text-inkmuted">
                  <span>{r.mode} · {r.language}</span>
                  <span>{r.total > 0 ? `${r.total}/100` : "unscored"}</span>
                </div>
              </button>
            ))}
          </div>

          {selected && <ReviewPanel key={selected.id} attempt={selected} onDone={() => setSelectedId(null)} />}
        </div>
      )}
    </div>
  );
}

function ReviewPanel({ attempt, onDone }: { attempt: NonNullable<ReturnType<typeof useQueueType>>; onDone: () => void }) {
  const rubric: RubricItem[] = useMemo(() => {
    try { return JSON.parse((attempt.scenario?.rubric as string) ?? "[]"); } catch { return []; }
  }, [attempt.scenario?.rubric]);
  const existing = attempt.scores;
  const [draft, setDraft] = useState<ScoreDraft>(() => {
    const d: ScoreDraft = {};
    for (const r of rubric) {
      const ex = existing.find(s => s.dimension === r.key);
      d[r.key] = { score: ex?.score ?? 0, feedback: ex?.feedback ?? "" };
    }
    return d;
  });
  const [note, setNote] = useState("");
  const utils = trpc.useUtils();
  const review = trpc.academy.attempts.review.useMutation({
    onSuccess: () => { void utils.academy.attempts.reviewQueue.invalidate(); onDone(); },
  });
  const total = Object.values(draft).reduce((sum, v) => sum + (Number(v.score) || 0), 0);

  return (
    <div className="paper-card p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="eyebrow mb-1">{attempt.learnerName} · {formatDate(attempt.createdAt)}</div>
          <h2 className="text-[24px] leading-tight">{attempt.scenario?.title}</h2>
          <div className="mt-1 text-[11.5px] text-inkmuted">{attempt.scenario?.product} · {attempt.mode} · {attempt.language.toUpperCase()} · {attempt.durationSeconds ? `${Math.round(attempt.durationSeconds / 60)} min` : "duration not recorded"}</div>
        </div>
        <div className="text-right">
          <div className="display text-[34px] leading-none">{total}<span className="text-[16px] text-inkmuted">/100</span></div>
          <div className="eyebrow mt-1">Provisional</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {attempt.reflection && (
            <div>
              <div className="eyebrow mb-1.5">Structured response</div>
              <p className="whitespace-pre-wrap rounded-sm border border-line bg-paper p-3 text-[12.5px] leading-relaxed">{attempt.reflection}</p>
            </div>
          )}
          {attempt.transcript && (
            <div>
              <div className="eyebrow mb-1.5">Transcript</div>
              <pre className="scroll-thin max-h-64 overflow-auto whitespace-pre-wrap rounded-sm border border-line bg-paper p-3 font-sans text-[12.5px] leading-relaxed">{attempt.transcript}</pre>
            </div>
          )}
          {attempt.aiShared && attempt.aiCoaching && (
            <div className="rounded-sm border border-[#e3c690] bg-[#f8efdd] p-3">
              <div className="eyebrow mb-1.5 flex items-center gap-1 text-[#8a5a10]"><Quote className="h-3 w-3" /> AI note shared by the learner — advisory only</div>
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#6b4a12]">{attempt.aiCoaching}</p>
            </div>
          )}

          <div>
            <div className="eyebrow mb-2">Rubric · formal human assessment</div>
            <div className="space-y-3">
              {rubric.map(r => (
                <div key={r.key} className="grid gap-2 border-b border-line/70 pb-3 md:grid-cols-[1fr_90px]">
                  <div>
                    <div className="text-[12.5px] font-medium">{r.label} <span className="text-inkmuted">/{r.max}</span></div>
                    <div className="text-[11px] text-inkmuted">{r.observable}</div>
                    <input value={draft[r.key]?.feedback ?? ""} onChange={e => setDraft(d => ({ ...d, [r.key]: { ...d[r.key], feedback: e.target.value } }))} placeholder="Observed behaviour and its effect…" className="mt-1.5 w-full rounded-sm border border-line bg-paper px-2 py-1.5 text-[11.5px] outline-none focus:border-teal" />
                  </div>
                  <input type="number" min={0} max={r.max} value={draft[r.key]?.score ?? 0} onChange={e => setDraft(d => ({ ...d, [r.key]: { ...d[r.key], score: Math.max(0, Math.min(r.max, Number(e.target.value))) } }))} className="h-9 w-full rounded-sm border border-line bg-paper px-2 text-center text-[13px] tabular-nums outline-none focus:border-teal" aria-label={`${r.label} score`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-sm border border-line bg-paper p-3">
            <div className="eyebrow mb-1.5">Reviewer note</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="Summary for the learner…" className="w-full resize-y rounded-sm border border-line bg-card p-2 text-[12px] outline-none focus:border-teal" />
          </div>
          <button
            onClick={() => review.mutate({ attemptId: attempt.id, scores: rubric.map(r => ({ dimension: r.key, score: draft[r.key]?.score ?? 0, feedback: draft[r.key]?.feedback || undefined })), note: note || undefined })}
            disabled={review.isPending || rubric.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-[13px] font-medium text-paper hover:bg-ink-soft disabled:opacity-40"
          >
            {review.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save formal review
          </button>
          {review.error && <p className="text-[11px] text-[#a33b2b]">{review.error.message}</p>}
          <p className="text-[10.5px] leading-relaxed text-inkmuted">Scores are stored with human attribution and your reviewer identity. AI suggestions never become a score automatically.</p>
        </div>
      </div>
    </div>
  );
}

// Helper type only — never called at runtime.
function useQueueType() {
  return {} as { id: number; learnerName: string; status: string; mode: string; language: string; total: number; reflection: string | null; transcript: string | null; aiShared: boolean; aiCoaching: string | null; createdAt: Date; durationSeconds: number; scenario: { title: string; product: string; rubric: string | null } | null; scores: Array<{ dimension: string; score: number; maxScore: number; feedback: string | null }> };
}
