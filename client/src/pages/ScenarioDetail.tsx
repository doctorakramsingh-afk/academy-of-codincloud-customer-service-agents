import { AcademyShell } from "@/components/academy/AcademyShell";
import { AudioPlayer } from "@/components/academy/AudioPlayer";
import { DifficultyBadge, EmptyState, FactStamp, Folio, LanguageChip } from "@/components/academy/ui";
import { formatDuration, languageLabel } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Headphones, ShieldCheck, TextQuote } from "lucide-react";
import { Link, useParams } from "wouter";

export default function ScenarioDetail() {
  const params = useParams<{ slug: string }>();
  const q = trpc.academy.scenarios.get.useQuery({ slug: params.slug ?? "" }, { enabled: Boolean(params.slug) });

  return (
    <AcademyShell>
      {q.isLoading ? (
        <div className="py-24 text-center text-sm text-inkmuted">Opening the folio…</div>
      ) : !q.data ? (
        <EmptyState title="Folio not found">This scenario may have been archived. Return to the library to choose another.</EmptyState>
      ) : (
        <div className="animate-rise">
          <Link href="/library" className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-inkmuted hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> Back to library</Link>

          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <Folio n={q.data.folio} />
                <div className="flex flex-wrap items-center gap-1.5">
                  <LanguageChip language={q.data.language} />
                  <DifficultyBadge difficulty={q.data.difficulty} />
                  <span className="stamp">{q.data.modality === "audio" ? <Headphones className="h-3 w-3" /> : <TextQuote className="h-3 w-3" />}{q.data.modality === "audio" ? formatDuration(q.data.durationSeconds) : "Text-only"}</span>
                </div>
              </div>
              <h1 className="max-w-[760px] text-[34px] leading-[1.08] md:text-[44px]">{q.data.title}</h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-inkmuted">{q.data.summary}</p>

              <div className="mt-7">
                {q.data.audioUrl ? (
                  <AudioPlayer src={q.data.audioUrl} title={q.data.title} fallbackDuration={q.data.durationSeconds} />
                ) : (
                  <div className="paper-card flex items-start gap-3 p-5">
                    <TextQuote className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    <div>
                      <div className="text-[13px] font-medium">Text-only folio</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-inkmuted">There is no recording for this scenario. Run it as a text role-play or a structured written response. The AI interviewer alternates languages where the folio defines a pair.</p>
                    </div>
                  </div>
                )}
              </div>

              <section className="mt-9 border-t border-line pt-7">
                <div className="eyebrow mb-3">Scenario brief</div>
                <div className="prose-editorial max-w-2xl text-[14px]"><p>{q.data.brief}</p></div>
              </section>

              <section className="mt-8 border-t border-line pt-7">
                <div className="eyebrow mb-3">Coaching focus</div>
                <p className="max-w-2xl border-l-2 border-teal pl-4 text-[14px] leading-relaxed">{q.data.coachingFocus}</p>
              </section>

              <section className="mt-8 border-t border-line pt-7">
                <div className="eyebrow mb-3">Evaluation rubric · 100 points</div>
                <div className="overflow-hidden rounded-sm border border-line">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-paper-2/60">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Dimension</th>
                        <th className="px-3 py-2 font-semibold">Observable</th>
                        <th className="px-3 py-2 text-right font-semibold">Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {q.data.rubric.map(r => (
                        <tr key={r.key}>
                          <td className="px-3 py-2 font-medium">{r.label}</td>
                          <td className="px-3 py-2 text-inkmuted">{r.observable}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.max}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="paper-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="eyebrow">Product truth</div>
                  <FactStamp approved={q.data.factApproved} version={q.data.factVersion} />
                </div>
                <p className="text-[12px] leading-relaxed text-inkmuted">
                  AI role-play uses only the administrator-approved {q.data.product} fact baseline. Where a capability is conditional, the correct move is to name it and verify — never to improvise.
                </p>
              </div>

              <div className="paper-card p-5">
                <div className="eyebrow mb-3">Folio record</div>
                <dl className="space-y-3 text-[12.5px]">
                  {[
                    ["Product", q.data.product],
                    ["Sector", q.data.sector],
                    ["Persona", q.data.persona],
                    ["Spoken language", languageLabel(q.data.language)],
                    ["Format", q.data.modality === "audio" ? `Recording · ${formatDuration(q.data.durationSeconds)}` : "Text-only"],
                    ["Fact baseline", q.data.factVersion ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3 border-b border-line/70 pb-2 last:border-0 last:pb-0">
                      <dt className="w-28 shrink-0 text-inkmuted">{k}</dt>
                      <dd className="font-medium leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="paper-card p-5">
                <div className="eyebrow mb-3">Competencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {q.data.competencies.map(c => <span key={c} className="rounded-sm bg-paper-2 px-2 py-1 text-[11px]">{c}</span>)}
                </div>
              </div>

              <Link href={`/practice/${q.data.slug}`} className="flex items-center justify-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
                Start practice <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-inkmuted">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                Fictional scenario. Practice records are stored only with your consent and can be deleted from your account.
              </div>
            </aside>
          </div>
        </div>
      )}
    </AcademyShell>
  );
}
