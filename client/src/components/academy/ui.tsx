import { Check, CircleAlert, Clock3, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS, STATUS_LABELS, languageLabel } from "@/lib/academy";

export function FactStamp({ approved, version }: { approved: boolean; version?: string | null }) {
  return approved ? (
    <span className="stamp stamp-verified">
      <ShieldCheck className="h-3 w-3" /> Verified {version ?? ""}
    </span>
  ) : (
    <span className="stamp stamp-review">
      <CircleAlert className="h-3 w-3" /> Needs review
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "reviewed"
      ? "stamp-verified"
      : status === "submitted"
        ? "stamp-review"
        : "";
  return <span className={cn("stamp", tone)}>{STATUS_LABELS[status] ?? status}</span>;
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className="stamp">{DIFFICULTY_LABELS[difficulty] ?? difficulty}</span>;
}

export function LanguageChip({ language }: { language: string }) {
  return <span className="stamp border-line/80 bg-paper-2/60">{languageLabel(language)}</span>;
}

export function Folio({ n }: { n: number }) {
  return <span className="folio-number">{n.toString().padStart(2, "0")}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h2 className="text-[28px] leading-tight md:text-[32px]">{title}</h2>
      {children && <div className="mt-2 max-w-2xl text-[14px] leading-relaxed text-inkmuted">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="paper-card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 text-teal">{icon ?? <Clock3 className="h-5 w-5" />}</div>
      <p className="display text-xl">{title}</p>
      {children && <div className="max-w-md text-sm leading-relaxed text-inkmuted">{children}</div>}
    </div>
  );
}

export function ConsentNote({ granted, children }: { granted: boolean; children?: ReactNode }) {
  return (
    <div className={cn("flex items-start gap-2 rounded-sm border px-3 py-2 text-[12px] leading-relaxed", granted ? "border-teal/30 bg-[#e8f4f0] text-[#0b6b5e]" : "border-[#e3c690] bg-[#f8efdd] text-[#8a5a10]")}>
      {granted ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

export function Metric({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="border-l border-line pl-4">
      <div className="eyebrow mb-2">{label}</div>
      <div className="display text-[30px] leading-none">{value}</div>
      {hint && <div className="mt-1 text-[12px] text-inkmuted">{hint}</div>}
    </div>
  );
}
