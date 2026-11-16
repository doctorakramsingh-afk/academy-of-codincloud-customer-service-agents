import { AcademyShell, SignInGate, useAcademy } from "@/components/academy/AcademyShell";
import { EmptyState, SectionHeading, StatusBadge } from "@/components/academy/ui";
import { formatDate } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ClipboardCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function AssignmentsInner() {
  const { me } = useAcademy();
  const utils = trpc.useUtils();
  const assignments = trpc.academy.assignments.mine.useQuery();
  const attempts = trpc.academy.attempts.mine.useQuery();
  const consents = trpc.academy.consent.get.useQuery();
  const setConsent = trpc.academy.consent.set.useMutation({ onSuccess: () => { void utils.academy.me.invalidate(); void utils.academy.consent.get.invalidate(); } });
  const del = trpc.academy.account.deleteMine.useMutation({ onSuccess: () => window.location.reload() });
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="animate-rise">
      <SectionHeading eyebrow="My assignments" title="Your practice record.">
        Assignments are seeded by an administrator. One coach owns each learner/scenario pair. Formal feedback is always human.
      </SectionHeading>

      {(assignments.data ?? []).length === 0 ? (
        <EmptyState title="No assignment yet" icon={<ClipboardCheck className="h-5 w-5" />}>
          Browse the library and practise any folio. An administrator or coach can later assign a scenario to you.
          <div className="mt-4"><Link href="/library" className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-[12.5px] font-medium text-paper">Open library <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </EmptyState>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {assignments.data!.map(a => (
            <div key={a.id} className="grid gap-3 py-5 md:grid-cols-[1fr_150px_150px_110px] md:items-center">
              <div>
                <Link href={a.scenario ? `/scenarios/${a.scenario.slug}` : "/library"} className="text-[17px] hover:text-teal-dark">{a.scenario?.title ?? "Scenario"}</Link>
                <div className="mt-1 text-[11.5px] text-inkmuted">{a.scenario?.product} · coach {a.coachName ?? "not assigned"} · due {formatDate(a.dueAt)}</div>
              </div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-inkmuted">Seed: {a.seedSource}</div>
              <div><StatusBadge status={a.status} /></div>
              <div className="md:text-right">
                {a.scenario && <Link href={`/practice/${a.scenario.slug}`} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-teal-dark link-underline">Practise <ArrowRight className="h-3 w-3" /></Link>}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-12">
        <SectionHeading eyebrow="Attempt history" title="Saved attempts" />
        {(attempts.data ?? []).length === 0 ? (
          <p className="text-sm text-inkmuted">No saved attempt yet. Practice records appear here only after you consent and save.</p>
        ) : (
          <div className="overflow-hidden rounded-sm border border-line">
            <table className="w-full text-left text-[12.5px]">
              <thead className="bg-paper-2/60">
                <tr>
                  <th className="px-3 py-2 font-semibold">Folio</th>
                  <th className="px-3 py-2 font-semibold">Mode</th>
                  <th className="px-3 py-2 font-semibold">Language</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {attempts.data!.map(a => (
                  <tr key={a.id}>
                    <td className="px-3 py-2">{a.scenario ? <Link href={`/scenarios/${a.scenario.slug}`} className="hover:text-teal-dark">{a.scenario.title}</Link> : "—"}</td>
                    <td className="px-3 py-2 capitalize">{a.mode}</td>
                    <td className="px-3 py-2 uppercase">{a.language}</td>
                    <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-2 text-inkmuted">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="paper-card p-5">
          <div className="eyebrow mb-3">Consent</div>
          <p className="mb-4 text-[12.5px] leading-relaxed text-inkmuted">Practice records are stored only with your consent. Revoking stops future storage; it does not delete existing records — use the deletion control for that.</p>
          {[
            ["practice_records", "Store practice attempts"],
            ["ai_note_sharing", "Share AI coaching notes with my assigned coach"],
          ].map(([purpose, label]) => {
            const granted = (consents.data ?? me?.consents ?? {})[purpose] === "granted";
            return (
              <label key={purpose} className="mb-3 flex items-center justify-between gap-3 border-b border-line/70 pb-3 text-[12.5px] last:border-0">
                <span>{label}</span>
                <input type="checkbox" checked={granted} onChange={e => setConsent.mutate({ purpose: purpose as "practice_records" | "ai_note_sharing", granted: e.target.checked })} className="h-4 w-4 accent-teal" />
              </label>
            );
          })}
        </div>

        <div className="paper-card border-[#e3c690] p-5">
          <div className="eyebrow mb-3 text-[#8a5a10]">Delete my records</div>
          <p className="mb-4 text-[12.5px] leading-relaxed text-inkmuted">Permanently deletes only your own attempts, learner assignments, consent rows and Academy profile. Minimal security audit events are retained. This cannot be undone.</p>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-sm border border-[#c9a15c] px-3 py-1.5 text-[12px] font-medium text-[#8a5a10] hover:bg-[#f8efdd]">
              <ShieldOff className="h-3.5 w-3.5" /> Delete my Academy records
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => del.mutate()} disabled={del.isPending} className="rounded-sm bg-[#a33b2b] px-3 py-1.5 text-[12px] font-medium text-paper disabled:opacity-40">Yes, delete permanently</button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-sm border border-line px-3 py-1.5 text-[12px]">Cancel</button>
            </div>
          )}
          {del.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{del.error.message}</p>}
        </div>
      </section>
    </div>
  );
}

export default function Assignments() {
  return (
    <AcademyShell>
      <Gate />
    </AcademyShell>
  );
}

function Gate() {
  const { loading, authenticated } = useAcademy();
  if (loading) return <div className="py-24 text-center text-sm text-inkmuted">Loading your record…</div>;
  if (!authenticated) return <SignInGate title="Sign in to see your assignments">Assignments, attempts and consent are tied to your verified Academy account.</SignInGate>;
  return <AssignmentsInner />;
}
