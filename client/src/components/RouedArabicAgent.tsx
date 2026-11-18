import { useEffect, useRef, useState } from "react";
import { MessageCircle, Pause, Play, Volume2, X } from "lucide-react";

const DISMISSED_KEY = "roued-arabic-agent-dismissed";

export default function RouedArabicAgent() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
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

  const dismiss = () => {
    audioRef.current?.pause();
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    setOpen(false);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const reopen = () => {
    setDismissed(false);
    setOpen(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]" dir="rtl">
      <audio ref={audioRef} src="/roued-arabic-welcome.mp3" preload="metadata" />

      {open && (
        <section
          aria-label="رسالة Roued El Fadhel الترحيبية"
          className="mb-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-teal/30 bg-card text-card-foreground shadow-2xl shadow-ink/20 animate-rise"
        >
          <div className="flex items-start gap-3 bg-ink px-4 py-3 text-paper">
            <img
              src="/roued-el-fadhel.png"
              alt="Roued El Fadhel"
              className="h-12 w-12 shrink-0 rounded-full border-2 border-teal object-cover object-top"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-100">وكيل المكالمة</p>
              <h2 className="mt-1 text-base font-semibold">Roued El Fadhel</h2>
              <p className="mt-1 text-xs leading-5 text-paper/75">رسالة عربية اختيارية من أجل التعلّم والتطوير المشترك</p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="إغلاق رسالة Roued El Fadhel"
              className="rounded-full p-1 text-paper/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4 text-right">
            <p className="text-sm leading-7 text-ink/80">
              مرحباً بكم في الأكاديمية. استمعوا إلى الرسالة العربية، ثم ابدأوا التدريب على التسويق والتواصل في حلول CodinCloud.
            </p>
            <button
              type="button"
              onClick={toggleAudio}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "إيقاف الرسالة الصوتية" : "استماع إلى رسالة Roued"}
            </button>
            <p className="text-[11px] leading-5 text-inkmuted">
              لا يبدأ الصوت تلقائياً. اضغط على الزر للاستماع، ويمكنك إغلاق هذه البطاقة من زر X.
            </p>
          </div>
        </section>
      )}

      <div className="flex items-center justify-end gap-2">
        {!open && !dismissed && (
          <span className="rounded-full border border-teal/25 bg-card px-3 py-2 text-xs font-medium text-ink shadow-lg">
            رسالة ترحيبية من Roued
          </span>
        )}
        <button
          type="button"
          onClick={dismissed ? reopen : () => setOpen(value => !value)}
          aria-label={open ? "إغلاق نافذة وكيل المكالمة" : "فتح وكيل المكالمة Roued El Fadhel"}
          className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-teal bg-ink shadow-xl shadow-ink/25 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <img src="/roued-el-fadhel.png" alt="" className="h-full w-full object-cover object-top" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-ink/75 py-1 text-paper">
            {open ? <X className="h-4 w-4" /> : dismissed ? <MessageCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </span>
        </button>
      </div>
    </div>
  );
}
