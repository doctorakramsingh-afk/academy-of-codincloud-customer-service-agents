import { useEffect, useRef, useState } from "react";
import { Globe2, MessageCircle, Pause, Play, Volume2, X } from "lucide-react";

const DISMISSED_KEY = "roued-welcome-v2-dismissed";
const LANGUAGE_KEY = "roued-welcome-language";

type WelcomeLanguage = "ar" | "fr" | "en";

const COPY: Record<WelcomeLanguage, {
  name: string;
  direction: "rtl" | "ltr";
  kicker: string;
  subtitle: string;
  body: string;
  play: string;
  stop: string;
  disclaimer: string;
  close: string;
}> = {
  ar: {
    name: "العربية",
    direction: "rtl",
    kicker: "متخصص تسويق وتطوير أعمال مستقل",
    subtitle: "Roued El Fadhel · أكاديمية CodinCloud",
    body: "مرحباً. اسمي روّاد الفاضل، روّاد مثل جمع رائد. أنا متخصص مستقل في التسويق الرقمي وتطوير الأعمال، وقد صممت فكرة هذه الأكاديمية المتواضعة والمفتوحة للتدرّب بجدية على بيع منتجات CodinCloud وخدمة العملاء والتواصل مع العملاء الصعبين باحترام ودبلوماسية من الدرجة الأولى.",
    play: "استمعوا إلى رسالة روّاد",
    stop: "إيقاف الرسالة الصوتية",
    disclaimer: "أيمن الشايب لم يَدّعِ تحمّل مسؤولية طريقة استخدام هذه المبادرة. على كل متدرّب التحقق من المعلومات الرسمية والتدرب بجد قبل تمثيل CodinCloud تجارياً.",
    close: "إغلاق رسالة Roued",
  },
  fr: {
    name: "Français",
    direction: "ltr",
    kicker: "Spécialiste freelance en marketing et développement commercial",
    subtitle: "Roued El Fadhel · Académie CodinCloud",
    body: "Bonjour, je m'appelle Roued El Fadhel. Je suis professeur polyglotte, spécialiste indépendant en marketing et développeur commercial freelance. Moi, Roued, avec Manus, nous avons conçu cette modeste plateforme comme portail d'entraînement. Elle n'a pas été conçue par Aymen Chaieb ni en son nom.",
    play: "Écouter le message de Roued",
    stop: "Arrêter le message audio",
    disclaimer: "Aymen Chaieb, fondateur de CodinCloud, reste le décideur final pour toute autorisation, tout engagement et toute formalité officielle, mais cette initiative pédagogique est distincte de lui et ne parle pas en son nom. Vérifiez les informations officielles et entraînez-vous sérieusement avant toute représentation commerciale.",
    close: "Fermer le message de Roued",
  },
  en: {
    name: "English",
    direction: "ltr",
    kicker: "Freelance marketing specialist and business developer",
    subtitle: "Roued El Fadhel · CodinCloud Academy",
    body: "Hello, I am Roued El Fadhel. I am an independent freelance marketing specialist and business developer, and I designed the idea for this humble, open Academy to practise CodinCloud sales, customer service, digital marketing and first-class diplomacy with difficult customers.",
    play: "Listen to Roued",
    stop: "Stop the welcome audio",
    disclaimer: "Aymen Chaieb has not claimed responsibility for how anyone uses this initiative. Verify official information and train seriously before representing CodinCloud commercially.",
    close: "Close Roued's welcome",
  },
};

const AUDIO: Record<WelcomeLanguage, string> = {
  ar: "/roued-welcome-ar.mp3",
  fr: "/roued-welcome-fr.mp3",
  en: "/roued-welcome-en.mp3",
};

export default function RouedArabicAgent() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [language, setLanguage] = useState<WelcomeLanguage>("ar");
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const autoPlayAttempted = useRef(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage === "ar" || savedLanguage === "fr" || savedLanguage === "en") setLanguage(savedLanguage);
    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    setDismissed(wasDismissed);
    setOpen(!wasDismissed);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    if (!open || dismissed || autoPlayAttempted.current) return;
    autoPlayAttempted.current = true;
    const timer = window.setTimeout(() => {
      void audioRef.current?.play().catch(() => {
        // Browsers may block autoplay; the visible play button remains available.
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [open, dismissed]);

  const copy = COPY[language];

  const changeLanguage = (next: WelcomeLanguage) => {
    audioRef.current?.pause();
    setPlaying(false);
    setLanguage(next);
    localStorage.setItem(LANGUAGE_KEY, next);
    requestAnimationFrame(() => audioRef.current?.load());
  };

  const dismiss = () => {
    audioRef.current?.pause();
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    setOpen(false);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const reopen = () => {
    setDismissed(false);
    setOpen(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]" dir={copy.direction}>
      <audio ref={audioRef} src={AUDIO[language]} preload="metadata" />

      {open && (
        <section aria-label={`${copy.subtitle} welcome`} className="mb-3 w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-teal/30 bg-card text-card-foreground shadow-2xl shadow-ink/20 animate-rise">
          <div className="flex items-start gap-3 bg-ink px-4 py-3 text-paper">
            <img src="/roued-el-fadhel.png" alt="Roued El Fadhel" className="h-14 w-14 shrink-0 rounded-full border-2 border-teal object-cover object-top" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100">{copy.kicker}</p>
              <h2 className="mt-1 text-base font-semibold">Roued El Fadhel</h2>
              <p className="mt-1 text-xs leading-5 text-paper/75">{copy.subtitle}</p>
            </div>
            <button type="button" onClick={dismiss} aria-label={copy.close} className="rounded-full p-1 text-paper/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex items-center gap-2 border-b border-line bg-paper-2/50 px-4 py-2">
            <Globe2 className="h-4 w-4 shrink-0 text-teal" />
            <label htmlFor="roued-language" className="text-xs font-medium text-inkmuted">Language / Langue / اللغة</label>
            <select id="roued-language" value={language} onChange={event => changeLanguage(event.target.value as WelcomeLanguage)} className="ml-auto rounded-md border border-line bg-card px-2 py-1 text-xs text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-3 p-4" dir={copy.direction}>
            <p className="text-sm leading-7 text-ink/80">{copy.body}</p>
            <button type="button" onClick={toggleAudio} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? copy.stop : copy.play}
            </button>
            <p className="border-t border-line pt-3 text-[11px] leading-5 text-inkmuted">{copy.disclaimer}</p>
            <p className="text-[10px] leading-5 text-inkmuted">Audio starts only after you press the button. Close with X; reopen from the Roued icon whenever needed.</p>
          </div>
        </section>
      )}

      <div className="flex items-center justify-end gap-2">
        {!open && !dismissed && <span className="rounded-full border border-teal/25 bg-card px-3 py-2 text-xs font-medium text-ink shadow-lg">Roued welcomes you · {copy.name}</span>}
        <button type="button" onClick={dismissed ? reopen : () => setOpen(value => !value)} aria-label={open ? "Close Roued welcome" : "Open Roued welcome agent"} className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-teal bg-ink shadow-xl shadow-ink/25 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal">
          <img src="/roued-el-fadhel.png" alt="Roued El Fadhel" className="h-full w-full object-cover object-top" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-ink/75 py-1 text-paper">{open ? <X className="h-4 w-4" /> : dismissed ? <MessageCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</span>
        </button>
      </div>
    </div>
  );
}
