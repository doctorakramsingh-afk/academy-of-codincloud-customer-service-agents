import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/academy";

export function AudioPlayer({ src, title, fallbackDuration = 0 }: { src: string; title: string; fallbackDuration?: number }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [src]);

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const skip = (delta: number) => {
    const audio = ref.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
  };

  const changeRate = () => {
    const next = rate === 1 ? 1.25 : rate === 1.25 ? 0.75 : 1;
    setRate(next);
    if (ref.current) ref.current.playbackRate = next;
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="paper-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/50 px-4 py-2">
        <div className="eyebrow">Simulation recording · French</div>
        <div className="flex items-center gap-1 text-[11px] text-inkmuted"><Volume2 className="h-3 w-3" /> {formatDuration(duration)}</div>
      </div>
      <div className="p-4">
        <p className="mb-3 text-[13px] font-medium leading-snug">{title}</p>
        <audio ref={ref} src={src} preload="metadata" />
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-paper-3">
          <div className="h-full bg-teal transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
        <input
          aria-label="Seek in recording"
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={time}
          onChange={e => {
            const v = Number(e.target.value);
            setTime(v);
            if (ref.current) ref.current.currentTime = v;
          }}
          className="mb-3 w-full accent-teal"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => skip(-15)} className="rounded-sm border border-line p-2 hover:bg-paper-2" aria-label="Back 15 seconds">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={toggle} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper hover:bg-ink-soft" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>
          <button onClick={() => skip(15)} className="rounded-sm border border-line p-2 hover:bg-paper-2" aria-label="Forward 15 seconds">
            <RotateCw className="h-4 w-4" />
          </button>
          <button onClick={changeRate} className="ml-1 rounded-sm border border-line px-2 py-1 text-[11px] font-semibold tabular-nums hover:bg-paper-2" aria-label="Change playback speed">
            {rate}×
          </button>
          <span className="ml-auto text-[11px] tabular-nums text-inkmuted">{formatDuration(time)} / {formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}
