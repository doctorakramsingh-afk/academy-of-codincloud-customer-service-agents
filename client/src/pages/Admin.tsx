import { AcademyShell, SignInGate, useAcademy } from "@/components/academy/AcademyShell";
import { EmptyState, FactStamp, Metric, SectionHeading } from "@/components/academy/ui";
import { formatDate } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { Check, Database, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Admin() {
  return (
    <AcademyShell>
      <Gate />
    </AcademyShell>
  );
}

function Gate() {
  const { loading, authenticated, me } = useAcademy();
  if (loading) return <div className="py-24 text-center text-sm text-inkmuted">Loading administration…</div>;
  if (!authenticated) return <SignInGate title="Sign in to administer">Administration is restricted to the Academy administrator role.</SignInGate>;
  if (me?.profile.role !== "admin") return <EmptyState title="Administrator access required">Your role is {me?.profile.role ?? "learner"}. Ask an existing administrator to promote you.</EmptyState>;
  return <AdminInner />;
}

function AdminInner() {
  const utils = trpc.useUtils();
  const stats = trpc.academy.admin.stats.useQuery();
  const users = trpc.academy.admin.users.useQuery();
  const audit = trpc.academy.admin.audit.useQuery();
  const seed = trpc.academy.admin.seedDemo.useMutation({ onSuccess: () => { void utils.academy.admin.stats.invalidate(); void utils.academy.admin.users.invalidate(); void utils.academy.admin.audit.invalidate(); } });
  const approve = trpc.academy.admin.approveFact.useMutation({ onSuccess: () => { void utils.academy.admin.stats.invalidate(); void utils.academy.admin.facts.invalidate(); } });
  const setRole = trpc.academy.admin.setRole.useMutation({ onSuccess: () => { void utils.academy.admin.users.invalidate(); } });
  const [seeded, setSeeded] = useState(false);

  return (
    <div className="animate-rise">
      <SectionHeading eyebrow="Administration" title="Governance, facts and access.">
        Approve the product-fact baseline before AI role-play, seed the fictional demo cohort, and control Academy roles. Every privileged change writes a minimal audit event.
      </SectionHeading>

      <div className="mb-8 grid grid-cols-2 gap-5 border-y border-line py-5 md:grid-cols-5">
        <Metric label="Scenarios" value={stats.data?.scenarios ?? "—"} />
        <Metric label="Audio assets" value={stats.data?.audioAssets ?? "—"} />
        <Metric label="Attempts" value={stats.data?.attempts ?? "—"} />
        <Metric label="Reviewed" value={stats.data?.reviewed ?? "—"} />
        <Metric label="Learners" value={stats.data?.learners ?? "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="paper-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="eyebrow">Product-fact baseline</div>
            <ShieldCheck className="h-4 w-4 text-teal" />
          </div>
          <p className="mb-4 text-[12px] leading-relaxed text-inkmuted">AI role-play and coaching are blocked until at least one approved baseline exists for the scenario's product. Approving a version supersedes the previous one.</p>
          <div className="space-y-3">
            {(stats.data?.facts ?? []).map(f => (
              <div key={f.id} className="rounded-sm border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{f.product}</span>
                    <span className="text-[11px] text-inkmuted">{f.version}</span>
                    <FactStamp approved={f.status === "approved"} version={f.version} />
                  </div>
                  {f.status !== "approved" && (
                    <button onClick={() => approve.mutate({ product: f.product, version: f.version })} disabled={approve.isPending} className="inline-flex items-center gap-1 rounded-sm border border-line px-2 py-1 text-[11px] font-medium hover:bg-paper-2 disabled:opacity-40">
                      <Check className="h-3 w-3" /> Approve
                    </button>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-inkmuted">{f.content}</p>
                <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-inkmuted/70">{f.status === "approved" ? `Approved ${formatDate(f.approvedAt)}` : "Not approved"}</div>
              </div>
            ))}
          </div>
          {approve.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{approve.error.message}</p>}
        </section>

        <section className="space-y-5">
          <div className="paper-card p-5">
            <div className="mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-teal" /><div className="eyebrow">Demo cohort</div></div>
            <p className="mb-3 text-[12px] leading-relaxed text-inkmuted">Idempotently ensure the fictional coach Leïla and learners Yassine and Mariem, their seeded assignments and two submitted attempts exist. Real users are never created by this action.</p>
            <button onClick={() => { seed.mutate(); setSeeded(true); }} disabled={seed.isPending} className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 text-[12px] font-medium text-paper hover:bg-ink-soft disabled:opacity-40">
              {seed.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Ensure demo cohort
            </button>
            {seeded && !seed.isPending && !seed.error && <p className="mt-2 text-[11px] text-[#0b6b5e]">Demo cohort is in place.</p>}
            {seed.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{seed.error.message}</p>}
          </div>

          <div className="paper-card p-5">
            <div className="eyebrow mb-3">Recent audit events</div>
            <div className="scroll-thin max-h-64 space-y-2 overflow-auto">
              {(audit.data ?? []).slice(0, 12).map(e => (
                <div key={e.id} className="border-b border-line/60 pb-1.5 text-[11px] last:border-0">
                  <div className="font-medium">{e.action}</div>
                  <div className="text-inkmuted">{e.detail ?? `${e.entity} #${e.entityId ?? "—"}`} · {formatDate(e.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <SectionHeading eyebrow="Access" title="Academy roles" />
        <div className="overflow-hidden rounded-sm border border-line">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-paper-2/60">
              <tr>
                <th className="px-3 py-2 font-semibold">Account</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Academy role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(users.data ?? []).map(u => (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-medium">{u.name ?? `User #${u.id}`}</td>
                  <td className="px-3 py-2 text-inkmuted">{u.email ?? "—"}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.academyRole ?? "learner"}
                      onChange={e => setRole.mutate({ userId: u.id, role: e.target.value as "learner" })}
                      className="rounded-sm border border-line bg-paper px-2 py-1 text-[12px]"
                    >
                      {["learner", "coach", "interviewer", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {setRole.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{setRole.error.message}</p>}
        <p className="mt-3 text-[11px] leading-relaxed text-inkmuted">The first authenticated account becomes administrator automatically. Additional administrators must be promoted here. Coach access remains limited to administrator-seeded assignments.</p>
      </section>
    </div>
  );
}
