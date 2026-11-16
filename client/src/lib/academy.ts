export const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
  de: "Deutsch",
  es: "Español",
  "ar-fr": "Arabic ↔ French",
  "ar-en": "Arabic ↔ English",
  "en-fr": "English ↔ French",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In progress",
  submitted: "Awaiting review",
  reviewed: "Reviewed",
  draft: "Draft",
};

export const ROLE_LABELS: Record<string, string> = {
  learner: "Learner",
  coach: "Coach",
  interviewer: "Interviewer",
  admin: "Administrator",
};

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function isRtl(language: string) {
  return language === "ar" || language.startsWith("ar-");
}

export function languageLabel(code: string | null | undefined) {
  if (!code) return "—";
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}
