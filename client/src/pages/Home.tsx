import { AcademyShell, SignInGate, useAcademy } from "@/components/academy/AcademyShell";
import { FactStamp, Folio, LanguageChip, Metric, SectionHeading } from "@/components/academy/ui";
import { startLogin } from "@/const";
import { formatDuration, languageLabel } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

function Overview() {
  const { me, authenticated, loading } = useAcademy();
  const scenarios = trpc.academy.scenarios.list.useQuery();
  const status = trpc.academy.status.useQuery();
  const assignments = trpc.academy.assignments.mine.useQuery(undefined, { enabled: authenticated });
  const attempts = trpc.academy.attempts.mine.useQuery(undefined, { enabled: authenticated });
  const readiness = trpc.academy.interview.readiness.useQuery(undefined, { enabled: authenticated });

  const list = scenarios.data ?? [];
  const featured = list.slice(0, 4);
  const nextAssignment = (assignments.data ?? []).find(a => a.status !== "reviewed");
  const reviewed = (attempts.data ?? []).filter(a => a.status === "reviewed").length;

  return (
    <div className="animate-rise">
      <div className="mb-10 flex items-center justify-between">
        <div className="eyebrow">CodinCloud Academy · Editorial learning cockpit</div>
        <FactStamp approved={Boolean(status.data?.hasApprovedFacts ?? me?.hasApprovedFacts)} version={status.data?.approved?.[0]?.version ?? "v1.0"} />
      </div>

      <section className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <div className="rule-teal mb-5" />
          <h1 className="max-w-[720px] text-[44px] leading-[1.02] md:text-[60px]">
            Practice the hard conversation <em className="font-normal italic text-teal-dark">before</em> it happens.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-inkmuted">
            Real French simulations, structured reflection and bounded AI role-play for the people who represent CodinCloud. Know what is proven, what needs review, and what comes next.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {authenticated ? (
              <Link href={nextAssignment?.scenario ? `/scenarios/${nextAssignment.scenario.slug}` : "/library"} className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
                {nextAssignment ? "Continue your assignment" : "Open the library"} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button onClick={() => startLogin()} className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
                Sign in to practice <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <Link href="/library" className="inline-flex items-center gap-2 rounded-sm border border-line px-5 py-2.5 text-sm font-medium hover:bg-paper-2">
              <BookOpen className="h-4 w-4" /> Browse 126 folios
            </Link>
          </div>
        </div>

        <div className="paper-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="eyebrow">Your record</div>
            <span className="text-[11px] text-inkmuted">{authenticated ? (me?.user.name ?? "Learner") : "Guest"}</span>
          </div>
          {!authenticated ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-inkmuted">Sign in to see your assignments, saved attempts and interview readiness. Guest visitors can still listen to the public library.</p>
              <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                <Metric label="Folios" value={list.length || "18"} />
                <Metric label="With audio" value={list.filter(s => s.hasAudio).length || "14"} />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Attempts" value={attempts.data?.length ?? 0} />
                <Metric label="Reviewed" value={reviewed} hint="human feedback" />
              </div>
              <div className="border-t border-line pt-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="eyebrow">Interview readiness</span>
                  <span className="text-[12px] text-inkmuted">{readiness.data?.averageTotal ?? 0}/100</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-3">
                  <div className="h-full bg-teal" style={{ width: `${Math.min(100, readiness.data?.averageTotal ?? 0)}%` }} />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-inkmuted">Advisory evidence for a human interviewer — never a hiring decision.</p>
              </div>
              {nextAssignment?.scenario && (
                <Link href={`/scenarios/${nextAssignment.scenario.slug}`} className="block border-t border-line pt-4 hover:text-teal-dark">
                  <div className="eyebrow mb-1">Next assignment</div>
                  <div className="text-[13px] font-medium leading-snug">{nextAssignment.scenario.title}</div>
                  <div className="mt-1 text-[11px] text-inkmuted">{nextAssignment.scenario.product} · due {nextAssignment.dueAt ? new Date(nextAssignment.dueAt).toLocaleDateString("en-GB") : "not set"}</div>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-8 border-b border-line py-10 md:grid-cols-3">
        {[
          ["Discovery before pitch", "Ask about the client's reality before showing anything. One question at a time."],
          ["Evidence over adjectives", "Use approved product facts. Name what must be verified instead of inventing a capability."],
          ["Ownership after the sale", "A transfer is complete only when the next owner accepts it. Stay accountable until then."],
        ].map(([title, body], i) => (
          <div key={title} className="border-l border-line pl-5">
            <div className="folio-number mb-3 text-[24px] text-teal">{`0${i + 1}`}</div>
            <h3 className="text-[19px]">{title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-inkmuted">{body}</p>
          </div>
        ))}
      </section>

      <section className="pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Scenario folios" title="Recent simulations" className="mb-0">
            The 100-call English challenge is the first pack. French recordings and multilingual practice are also labelled clearly. Multilingual folios extend the practice into German, English, Spanish, Italian, Japanese, Chinese, Portuguese and French call-center selling for CodinCloud solutions.
          </SectionHeading>
          <Link href="/library" className="mb-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-teal-dark link-underline">
            All folios <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {featured.map(s => (
            <Link key={s.id} href={`/scenarios/${s.slug}`} className="paper-card group flex gap-4 p-5 transition-colors duration-150 hover:border-teal/50">
              <Folio n={s.folio} />
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <LanguageChip language={s.language} />
                  {s.hasAudio && <span className="text-[10px] uppercase tracking-[0.1em] text-inkmuted">{formatDuration(s.durationSeconds)}</span>}
                </div>
                <h3 className="text-[18px] leading-snug group-hover:text-teal-dark">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-inkmuted">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-sm border border-line bg-paper-2/40 px-5 py-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <p className="text-[12px] leading-relaxed text-inkmuted">
            Prototype populated with fictional training material. No real customer, candidate or employee data; no live-call recording; no automated hiring. AI role-play stays disabled until an administrator approves the current product-fact baseline.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <AcademyShell>
      <HomeRouter />
    </AcademyShell>
  );
}

function HomeRouter() {
  const { loading, authenticated } = useAcademy();
  if (loading) return <div className="py-24 text-center text-sm text-inkmuted">Opening the Academy…</div>;
  // Public overview for guests; full overview once signed in.
  return authenticated ? <Overview /> : <><GuestHero /><Overview /></>;
}

function GuestHero() {
  return (
    <div className="mb-6 rounded-sm border border-[#e3c690] bg-[#f8efdd] px-4 py-3 text-[12px] text-[#8a5a10]">
      You are browsing as a guest. <button onClick={() => startLogin()} className="link-underline font-semibold">Sign in with Manus</button> to save practice records and see assignments.
    </div>
  );
}
