import { AcademyShell, SignInGate, useAcademy } from "@/components/academy/AcademyShell";
import { EmptyState, Metric, SectionHeading } from "@/components/academy/ui";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Languages, Mic, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const PAIRS = [
  { code: "ar-fr", label: "Arabic ↔ French", note: "Seeded folio 18 alternates Modern Standard Arabic and French." },
  { code: "ar-en", label: "Arabic ↔ English", note: "Use the role-play language selector on a text folio; no dedicated recording yet." },
  { code: "en-fr", label: "English ↔ French", note: "Use the role-play language selector on a text folio; no dedicated recording yet." },
];

export default function Interview() {
  return (
    <AcademyShell>
      <Gate />
    </AcademyShell>
  );
}

function Gate() {
  const { loading, authenticated } = useAcademy();
  if (loading) return <div className="py-24 text-center text-sm text-inkmuted">Loading readiness evidence…</div>;
  if (!authenticated) return <SignInGate title="Sign in to see interview readiness">Readiness is built from your reviewed practice attempts, so it needs a verified account.</SignInGate>;
  return <InterviewInner />;
}

function InterviewInner() {
  const readiness = trpc.academy.interview.readiness.useQuery();
  const attempts = trpc.academy.attempts.mine.useQuery();
  const r = readiness.data;

  return (
    <div className="animate-rise">
      <SectionHeading eyebrow="Interview readiness" title="Evidence for a human conversation.">
        This page summarises reviewed practice. It is advisory evidence for an interviewer — never an automated hiring decision, and never a substitute for a live conversation.
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="paper-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <div className="eyebrow mb-2">Advisory readiness score</div>
              <div className="display text-[64px] leading-none">{r?.averageTotal ?? 0}<span className="text-[22px] text-inkmuted">/100</span></div>
              <div className="mt-1 text-[11.5px] text-inkmuted">Average of {r?.reviewedAttempts ?? 0} human-reviewed attempt{(r?.reviewedAttempts ?? 0) === 1 ? "" : "s"}</div>
            </div>
            <div className="text-right">
              <span className={`stamp ${r?.ready ? "stamp-verified" : "stamp-review"}`}>{r?.ready ? "Threshold reached" : "Below 85 threshold"}</span>
              <div className="mt-2 text-[11px] text-inkmuted">{r?.totalAttempts ?? 0} total attempt{(r?.totalAttempts ?? 0) === 1 ? "" : "s"}</div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {(r?.dimensions ?? []).length === 0 ? (
              <p className="py-8 text-center text-[13px] text-inkmuted">No rubric scores yet. Complete a practice attempt and ask your coach to review it.</p>
            ) : (
              r!.dimensions.map(d => {
                const max = Math.round(d.max) || 1;
                const pct = Math.round((d.average / max) * 100);
                return (
                  <div key={d.key}>
                    <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                      <span className="font-medium capitalize">{d.key}</span>
                      <span className="tabular-nums text-inkmuted">{d.average}/{max}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-3">
                      <div className="h-full bg-teal transition-[width] duration-200" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex items-start gap-2 border-t border-line pt-4 text-[11.5px] leading-relaxed text-inkmuted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
            Scores are attributed to a named human reviewer. AI coaching notes are advisory and never enter this calculation.
          </div>
        </div>

        <div className="space-y-4">
          <div className="paper-card p-5">
            <div className="eyebrow mb-3 flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" /> Bilingual pathways</div>
            <div className="space-y-3">
              {PAIRS.map(p => (
                <div key={p.code} className="rounded-sm border border-line p-3">
                  <div className="text-[13px] font-medium">{p.label}</div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-inkmuted">{p.note}</p>
                  <Link href={`/practice/${p.code === "ar-fr" ? "bilingual-interview" : "lanci-discovery"}`} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-teal-dark link-underline">
                    Open practice <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="eyebrow mb-3 flex items-center gap-1.5"><Mic className="h-3.5 w-3.5" /> Recent attempts</div>
            {(attempts.data ?? []).length === 0 ? (
              <p className="text-[12px] text-inkmuted">No attempt yet.</p>
            ) : (
              <div className="space-y-2">
                {attempts.data!.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-2 border-b border-line/60 pb-2 text-[11.5px] last:border-0">
                    <span className="line-clamp-1">{a.scenario?.title}</span>
                    <span className="shrink-0 uppercase text-inkmuted">{a.language}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {r && r.reviewedAttempts === 0 && (
            <EmptyState title="Start with one reviewed attempt">Your coach's first review creates the baseline for this page.</EmptyState>
          )}
          <div className="grid grid-cols-2 gap-4 px-1">
            <Metric label="Reviewed" value={r?.reviewedAttempts ?? 0} />
            <Metric label="Threshold" value={r?.threshold ?? 85} hint="advisory only" />
          </div>
        </div>
      </div>
    </div>
  );
}
