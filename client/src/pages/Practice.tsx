import { AcademyShell, SignInGate, useAcademy } from "@/components/academy/AcademyShell";
import { AudioPlayer } from "@/components/academy/AudioPlayer";
import { ConsentNote, FactStamp, Folio, LanguageChip } from "@/components/academy/ui";
import { LANGUAGE_LABELS, isRtl, languageLabel } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Loader2, MessageSquare, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

type Turn = { role: "user" | "assistant"; content: string };

function PracticeInner() {
  const { me } = useAcademy();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const scenario = trpc.academy.scenarios.get.useQuery({ slug }, { enabled: Boolean(slug) });
  const [tab, setTab] = useState<"listen" | "respond" | "roleplay">("listen");

  if (scenario.isLoading) return <div className="py-24 text-center text-sm text-inkmuted">Preparing the practice room…</div>;
  if (!scenario.data) return <div className="py-24 text-center text-sm text-inkmuted">This folio is unavailable.</div>;
  const s = scenario.data;

  return (
    <div className="animate-rise">
      <Link href={`/scenarios/${s.slug}`} className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-inkmuted hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> Back to folio</Link>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <Folio n={s.folio} />
          <div>
            <div className="eyebrow mb-1">Practice room · {s.product}</div>
            <h1 className="text-[28px] leading-tight md:text-[34px]">{s.title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <LanguageChip language={s.language} />
          <FactStamp approved={s.factApproved} version={s.factVersion} />
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-line">
        {([
          { key: "listen", label: "1 · Listen", Icon: MessageSquare },
          { key: "respond", label: "2 · Structured response", Icon: MessageSquare },
          { key: "roleplay", label: "3 · AI role-play", Icon: Sparkles },
        ] as const).map(({ key: K, label, Icon: I }) => {
          return (
            <button
              key={K}
              onClick={() => setTab(K)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] font-medium transition-colors ${tab === K ? "border-teal text-ink" : "border-transparent text-inkmuted hover:text-ink"}`}
            >
              <I className="h-3.5 w-3.5" /> {label}
            </button>
          );
        })}
      </div>

      {tab === "listen" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {s.audioUrl ? <AudioPlayer src={s.audioUrl} title={s.title} fallbackDuration={s.durationSeconds} /> : (
              <div className="paper-card p-6 text-[13px] leading-relaxed text-inkmuted">This is a text-only folio — there is no recording. Move to the structured response or AI role-play tab.</div>
            )}
            <div className="mt-5 paper-card p-5">
              <div className="eyebrow mb-2">While you listen</div>
              <ul className="space-y-2 text-[13px] leading-relaxed text-inkmuted">
                <li>• Who speaks first, and how is permission requested?</li>
                <li>• Which facts are stated, and which are deliberately left open?</li>
                <li>• What next step is proposed, and who owns it?</li>
              </ul>
            </div>
          </div>
          <div className="paper-card p-5">
            <div className="eyebrow mb-2">Brief</div>
            <p className="text-[13px] leading-relaxed text-inkmuted">{s.brief}</p>
            <div className="mt-4 border-t border-line pt-4">
              <div className="eyebrow mb-2">Coaching focus</div>
              <p className="border-l-2 border-teal pl-3 text-[13px] leading-relaxed">{s.coachingFocus}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "respond" && <StructuredResponse slug={s.slug} product={s.product} />}
      {tab === "roleplay" && <RolePlay slug={s.slug} languagePair={s.languagePair} approved={s.factApproved} defaultLanguage={me?.profile.preferredLanguage ?? "fr"} />}
    </div>
  );
}

function StructuredResponse({ slug, product }: { slug: string; product: string }) {
  const { me } = useAcademy();
  const utils = trpc.useUtils();
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(me?.consents.practice_records === "granted");
  const [saved, setSaved] = useState<number | null>(null);
  const submit = trpc.academy.attempts.submit.useMutation({
    onSuccess: r => { setSaved(r.attemptId); void utils.academy.attempts.mine.invalidate(); },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="paper-card p-5">
        <div className="eyebrow mb-2">Structured response</div>
        <p className="mb-3 text-[13px] leading-relaxed text-inkmuted">
          Write what you would say, what you would verify, and the next step you would propose for {product}. This is a reflection, not a script to memorise.
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          placeholder="Opening with permission… Discovery questions… What I would not claim… Next step and owner…"
          className="w-full resize-y rounded-sm border border-line bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-teal"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-start gap-2 text-[11.5px] leading-relaxed text-inkmuted">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-teal" />
            I consent to saving this practice record for my own history and my assigned coach.
          </label>
          <button
            onClick={() => submit.mutate({ scenarioSlug: slug, mode: "structured", language: "fr", reflection: text, consent, durationSeconds: 0 })}
            disabled={!text.trim() || submit.isPending}
            className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-[13px] font-medium text-paper hover:bg-ink-soft disabled:opacity-40"
          >
            {submit.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save attempt
          </button>
        </div>
        {submit.error && <p className="mt-2 text-[12px] text-[#a33b2b]">{submit.error.message}</p>}
        {saved && <p className="mt-3 rounded-sm border border-teal/30 bg-[#e8f4f0] px-3 py-2 text-[12px] text-[#0b6b5e]">Attempt #{saved} saved. <Link href="/assignments" className="link-underline font-semibold">See your assignments</Link>.</p>}
      </div>
      <div className="space-y-4">
        <div className="paper-card p-5">
          <div className="eyebrow mb-2">What good looks like</div>
          <ul className="space-y-2 text-[12.5px] leading-relaxed text-inkmuted">
            <li>• Permission asked before the pitch.</li>
            <li>• At least two discovery questions about the current process.</li>
            <li>• One capability named as conditional or unverified.</li>
            <li>• A next step with an owner and a realistic date.</li>
          </ul>
        </div>
        <ConsentNote granted={consent}>Without consent, the attempt is not saved. Consent can be revoked at any time from your account.</ConsentNote>
      </div>
    </div>
  );
}

function RolePlay({ slug, languagePair, approved, defaultLanguage }: { slug: string; languagePair: string | null; approved: boolean; defaultLanguage: string }) {
  const { me } = useAcademy();
  const utils = trpc.useUtils();
  const [language, setLanguage] = useState(languagePair ? languagePair.split("-")[0] : defaultLanguage);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [coaching, setCoaching] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [shared, setShared] = useState(false);
  const chat = trpc.academy.roleplay.chat.useMutation({
    onSuccess: r => setTurns(t => [...t, { role: "assistant", content: r.reply }]),
  });
  const coach = trpc.academy.roleplay.coaching.useMutation({ onSuccess: r => setCoaching(r.advisory) });
  const submit = trpc.academy.attempts.submit.useMutation({ onSuccess: r => { setAttemptId(r.attemptId); void utils.academy.attempts.mine.invalidate(); } });
  const share = trpc.academy.attempts.shareAi.useMutation({ onSuccess: () => setShared(true) });

  const transcript = turns.map(t => `${t.role === "user" ? "Learner" : "Client"}: ${t.content}`).join("\n");
  const rtl = isRtl(language);

  const send = () => {
    const text = input.trim();
    if (!text || chat.isPending) return;
    const next = [...turns, { role: "user" as const, content: text }];
    setTurns(next);
    setInput("");
    chat.mutate({ scenarioSlug: slug, language, messages: next, pair: languagePair ?? undefined });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="paper-card flex min-h-[520px] flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper-2/50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Simulated client</span>
            {languagePair ? <span className="stamp stamp-review">{LANGUAGE_LABELS[languagePair]}</span> : (
              <select value={language} onChange={e => setLanguage(e.target.value)} className="rounded-sm border border-line bg-paper px-2 py-1 text-[11px]" aria-label="Role-play language">
                {["fr", "en", "ar", "de", "es"].map(l => <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>)}
              </select>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-[0.1em] text-inkmuted">Advisory simulation · not a real customer</span>
        </div>

        <div dir={rtl ? "rtl" : "ltr"} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-5" style={{ maxHeight: 520 }}>
          {turns.length === 0 && (
            <div className="mx-auto max-w-sm py-10 text-center">
              <MessageSquare className="mx-auto mb-3 h-5 w-5 text-teal" />
              <p className="text-[13px] leading-relaxed text-inkmuted">Open the call as you would in real life: greet the client, ask for permission, then start discovery. The simulator will answer in character.</p>
            </div>
          )}
          {turns.map((t, i) => (
            <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-sm px-3.5 py-2.5 text-[13px] leading-relaxed ${t.role === "user" ? "bg-ink text-paper" : "border border-line bg-paper"}`}>
                <div className="mb-1 text-[9px] uppercase tracking-[0.12em] opacity-60">{t.role === "user" ? "You" : "Client"}</div>
                {t.content}
              </div>
            </div>
          ))}
          {chat.isPending && <div className="text-[12px] text-inkmuted">The client is thinking…</div>}
          {chat.error && <div className="rounded-sm border border-[#e3c690] bg-[#f8efdd] px-3 py-2 text-[12px] text-[#8a5a10]">{chat.error.message}</div>}
        </div>

        <div className="border-t border-line p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={approved ? "Your turn…" : "Waiting for the product-fact baseline approval"}
              disabled={!approved || chat.isPending}
              dir={rtl ? "rtl" : "ltr"}
              className="flex-1 rounded-sm border border-line bg-paper px-3 py-2 text-[13px] outline-none focus:border-teal disabled:opacity-50"
            />
            <button onClick={send} disabled={!approved || !input.trim() || chat.isPending} className="flex items-center gap-1.5 rounded-sm bg-teal px-3 py-2 text-[13px] font-medium text-paper hover:bg-teal-dark disabled:opacity-40">
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </div>
          {!approved && <p className="mt-2 text-[11px] text-[#8a5a10]">AI role-play is blocked until an administrator approves the current {me?.hasApprovedFacts ? "product" : "product-fact"} baseline.</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="paper-card p-5">
          <div className="eyebrow mb-2">Save this session</div>
          <p className="mb-3 text-[12px] leading-relaxed text-inkmuted">Chat turns are not stored automatically. Save the transcript only if you want it in your record.</p>
          <label className="mb-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-inkmuted">
            <input type="checkbox" checked={me?.consents.practice_records === "granted"} readOnly className="mt-0.5 accent-teal" />
            Practice-record consent: {me?.consents.practice_records === "granted" ? "granted" : "not granted — grant it from your account"}
          </label>
          <button
            onClick={() => submit.mutate({ scenarioSlug: slug, mode: "roleplay", language, transcript, reflection: "", consent: me?.consents.practice_records === "granted", durationSeconds: 0 })}
            disabled={!turns.length || submit.isPending || me?.consents.practice_records !== "granted"}
            className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-[12.5px] font-medium text-paper hover:bg-ink-soft disabled:opacity-40"
          >
            {submit.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save transcript
          </button>
          {submit.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{submit.error.message}</p>}
          {attemptId && <p className="mt-2 text-[11px] text-[#0b6b5e]">Attempt #{attemptId} saved.</p>}
        </div>

        <div className="paper-card p-5">
          <div className="eyebrow mb-2">Advisory coaching</div>
          <p className="mb-3 text-[12px] leading-relaxed text-inkmuted">Three observations from the transcript. Advisory only — never a score or a hiring judgement.</p>
          <button onClick={() => coach.mutate({ scenarioSlug: slug, transcript })} disabled={!turns.length || coach.isPending} className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-[12px] font-medium hover:bg-paper-2 disabled:opacity-40">
            {coach.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Ask for observations
          </button>
          {coach.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{coach.error.message}</p>}
          {coaching && <div className="mt-3 whitespace-pre-wrap rounded-sm border border-line bg-paper p-3 text-[12px] leading-relaxed">{coaching}</div>}
          {coaching && attemptId && (
            <label className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-inkmuted">
              <input type="checkbox" checked={shared} onChange={e => share.mutate({ attemptId, share: e.target.checked, note: coaching })} className="mt-0.5 accent-teal" />
              Share this AI note with my assigned coach (requires an administrator-seeded assignment).
            </label>
          )}
          {share.error && <p className="mt-2 text-[11px] text-[#a33b2b]">{share.error.message}</p>}
        </div>

        <ConsentNote granted={me?.consents.practice_records === "granted"}>
          {me?.consents.practice_records === "granted" ? "Practice-record consent is on. You can revoke it or delete your records from your account." : "Practice-record consent is off. Turn it on from your account to save attempts."}
        </ConsentNote>
      </div>
    </div>
  );
}

export default function Practice() {
  return (
    <AcademyShell>
      <PracticeGate />
    </AcademyShell>
  );
}

function PracticeGate() {
  const { loading, authenticated } = useAcademy();
  if (loading) return <div className="py-24 text-center text-sm text-inkmuted">Checking your session…</div>;
  if (!authenticated) return <SignInGate title="Sign in to practise">Practice records belong to a verified learner. Sign in with Manus to open the room.</SignInGate>;
  return <PracticeInner />;
}
