import { useState } from "react";
import { MessageCircle, Send, Sparkles, Volume2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

const CODIE_AVATAR = "/manus-storage/async-images/nWEfSHqymFyZfEoVm8NLQ6/image-1.webp";

const languages = [
  ["ar", "العربية"],
  ["en", "English"],
  ["fr", "Français"],
  ["es", "Español"],
  ["de", "Deutsch"],
  ["it", "Italiano"],
  ["pt", "Português"],
  ["ja", "日本語"],
  ["zh", "中文"],
] as const;

type ChatMessage = { role: "user" | "assistant"; content: string };

const SPEECH_LANGUAGES: Record<string, string> = {
  ar: "ar-SA", en: "en-US", fr: "fr-FR", es: "es-ES", de: "de-DE", it: "it-IT", pt: "pt-BR", ja: "ja-JP", zh: "zh-CN",
};

export default function CodieCoach() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("ar");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "مرحباً، أنا Codie، مدرّبتكم الرقمية في التسويق والمكالمات. اختاروا اللغة واسألوني عن الإقناع المهذب، اكتشاف احتياج العميل، أو التعامل الراقي مع أصعب الاعتراضات.",
    },
  ]);
  const chat = trpc.academy.roleplay.codieChat.useMutation({
    onSuccess: result => setMessages(current => [...current, { role: "assistant", content: result.reply }]),
  });

  const send = () => {
    const content = input.trim();
    if (!content || chat.isPending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    chat.mutate({ language, messages: next });
  };

  const selectedLanguage = languages.find(([code]) => code === language)?.[1] ?? "العربية";
  const isArabic = language === "ar";

  const speak = (content: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = SPEECH_LANGUAGES[language] ?? "en-US";
    utterance.rate = 0.94;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-5 left-5 z-[70]" dir={isArabic ? "rtl" : "ltr"}>
      {open && (
        <section className="mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#d9cfbd] bg-card text-card-foreground shadow-2xl shadow-ink/20 animate-rise">
          <header className="flex items-center gap-3 bg-[#24364d] px-4 py-3 text-paper">
            <img src={CODIE_AVATAR} alt="Codie" className="h-12 w-12 rounded-full border-2 border-[#0f9d8a] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fe4d5]">AI marketing coach</p>
              <h2 className="mt-1 text-base font-semibold">Codie</h2>
              <p className="text-xs text-paper/75">Five-star respect · ethical persuasion · tough calls</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Codie" className="rounded-full p-1 text-paper/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f9d8a]"><X className="h-4 w-4" /></button>
          </header>

          <div className="flex items-center gap-2 border-b border-line bg-paper-2/50 px-3 py-2">
            <Sparkles className="h-4 w-4 text-teal" />
            <label className="text-xs font-medium text-inkmuted" htmlFor="codie-language">Chat language</label>
            <select id="codie-language" value={language} onChange={event => setLanguage(event.target.value)} className="ml-auto rounded-md border border-line bg-card px-2 py-1 text-xs text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
              {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <img src={CODIE_AVATAR} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full object-cover" />}
                <div className={`max-w-[86%] rounded-xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-teal text-paper" : "bg-paper-2 text-ink"}`}>
                  {message.role === "assistant" ? (
                    <>
                      <Streamdown>{message.content}</Streamdown>
                      <button type="button" onClick={() => speak(message.content)} className="mt-2 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-inkmuted hover:bg-card" aria-label="Read Codie response aloud">
                        <Volume2 className="h-3 w-3" /> Read aloud
                      </button>
                    </>
                  ) : <p className="whitespace-pre-wrap">{message.content}</p>}
                </div>
              </div>
            ))}
            {chat.isPending && <p className="text-xs text-inkmuted">Codie is preparing a respectful coaching answer in {selectedLanguage}…</p>}
            {chat.error && <p className="rounded-md border border-[#e3c690] bg-[#f8efdd] px-3 py-2 text-xs leading-5 text-[#8a5a10]">{chat.error.message}</p>}
          </div>

          <div className="border-t border-line bg-background/60 p-3">
            <p className="mb-2 text-[11px] leading-5 text-inkmuted">Codie is an AI practice coach. Verify product details with an authorised human before making a promise.</p>
            <a href="/codie-marketing-playbook.md" target="_blank" rel="noreferrer" className="mb-2 inline-flex text-[11px] font-semibold text-teal-dark underline underline-offset-2">Open the 1,008-line multilingual playbook</a>
            <div className="flex items-end gap-2">
              <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask Codie for a tactic or role-play…" rows={2} className="min-h-10 flex-1 resize-none rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal" />
              <button type="button" onClick={send} disabled={!input.trim() || chat.isPending} aria-label="Send to Codie" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal text-paper transition hover:bg-teal-dark disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      )}

      <button id="codie-launcher" type="button" onClick={() => setOpen(value => !value)} aria-label={open ? "Close Codie" : "Open Codie marketing coach"} className="group flex items-center gap-2 rounded-full border-2 border-teal bg-[#24364d] p-1.5 pr-3 text-paper shadow-xl shadow-ink/25 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
        <img src={CODIE_AVATAR} alt="Codie" className="h-11 w-11 rounded-full object-cover" />
        <span className="text-right">
          <span className="block text-[10px] uppercase tracking-[0.12em] text-[#9fe4d5]">Open coach</span>
          <span className="block text-sm font-semibold">Codie</span>
        </span>
        <MessageCircle className="h-4 w-4 text-[#9fe4d5]" />
      </button>
    </div>
  );
}
