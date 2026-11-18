import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/academy";
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Mic,
  PenLine,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";

type Me = {
  user: { id: number; name: string | null; email: string | null };
  profile: { role: string; preferredLanguage: string; secondLanguage: string | null };
  consents: Record<string, "granted" | "revoked">;
  hasApprovedFacts: boolean;
  isAdmin: boolean;
};

const AcademyContext = createContext<{ me: Me | null; loading: boolean; authenticated: boolean }>({
  me: null,
  loading: true,
  authenticated: false,
});

export function useAcademy() {
  return useContext(AcademyContext);
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-paper">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
        <path d="M12 5.5H8.5A3.5 3.5 0 0 0 5 9v3.2c0 1.1-.4 2.1-1.2 2.8L3 15.8l.8.8c.8.7 1.2 1.7 1.2 2.8V21a3.5 3.5 0 0 0 3.5 3.5H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 5.5h3.5A3.5 3.5 0 0 1 25 9v3.2c0 1.1.4 2.1 1.2 2.8l.8.8-.8.8c-.8.7-1.2 1.7-1.2 2.8V21a3.5 3.5 0 0 1-3.5 3.5H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M13 11.5h4M13 15h4M13 18.5h4" stroke="#0F9D8A" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="display block text-[19px] tracking-tight">CodinCloud</span>
          <span className="eyebrow mt-1 block text-[9px] text-paper/55">Academy</span>
        </span>
      )}
    </Link>
  );
}

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/library", label: "Scenario library", icon: BookOpen },
  { href: "/courses/digital-marketing", label: "Marketing courses", icon: GraduationCap },
  { href: "/practice", label: "Practice", icon: PenLine },
  { href: "/assignments", label: "My assignments", icon: ClipboardCheck },
  { href: "/coach", label: "Review queue", icon: Users, roles: ["coach", "interviewer", "admin"] },
  { href: "/interview", label: "Interview readiness", icon: Mic },
  { href: "/admin", label: "Administration", icon: ShieldCheck, roles: ["admin"] },
];

function NavLinks({ role, onNavigate }: { role: string | null; onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.filter(n => !n.roles || (role && n.roles.includes(role))).map(item => {
        const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2.5 border-l-2 px-3 py-2 text-[13px] transition-colors duration-150",
              active
                ? "border-teal bg-white/5 text-paper"
                : "border-transparent text-paper/60 hover:border-paper/20 hover:text-paper",
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-teal" : "text-paper/40 group-hover:text-paper/70")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AcademyShell({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const meQuery = trpc.academy.me.useQuery(undefined, { enabled: isAuthenticated, retry: false, refetchOnWindowFocus: false });
  const [open, setOpen] = useState(false);
  const me = (meQuery.data as Me | undefined) ?? null;
  const role = me?.profile.role ?? null;
  const consentOk = me?.consents.practice_records === "granted";

  const value = { me, loading: authLoading || (isAuthenticated && meQuery.isLoading), authenticated: isAuthenticated };

  return (
    <AcademyContext.Provider value={value}>
      <div className="min-h-screen bg-paper">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
          <Wordmark />
          <button onClick={() => setOpen(o => !o)} className="rounded-sm p-1.5 text-paper/80 hover:bg-white/10" aria-label="Toggle navigation" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        {open && (
          <div className="fixed inset-x-0 top-[57px] z-40 border-b border-white/10 bg-ink px-3 pb-4 pt-2 lg:hidden">
            <NavLinks role={role} onNavigate={() => setOpen(false)} />
            <div className="mt-3 border-t border-white/10 pt-3">
              {isAuthenticated ? (
                <button onClick={() => logout()} className="flex items-center gap-2 px-3 py-2 text-[13px] text-paper/60"><LogOut className="h-4 w-4" /> Sign out</button>
              ) : (
                <button onClick={() => startLogin()} className="flex items-center gap-2 px-3 py-2 text-[13px] text-teal"><LogIn className="h-4 w-4" /> Sign in</button>
              )}
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop rail */}
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col bg-ink px-3 py-5 lg:flex">
            <div className="px-2 pb-6">
              <Wordmark />
            </div>
            <div className="mb-5 px-2">
              <div className="h-px w-full bg-white/10" />
            </div>
            <NavLinks role={role} />
            <div className="mt-auto space-y-3 px-2 pt-6">
              <div className="rounded-sm border border-white/10 px-3 py-2.5">
                {isAuthenticated ? (
                  <>
                    <div className="truncate text-[12px] font-medium text-paper/90">{me?.user.name ?? user?.name ?? "Signed in"}</div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-paper/45">{role ? ROLE_LABELS[role] : "Loading role"}</span>
                      <span className={cn("h-1.5 w-1.5 rounded-full", consentOk ? "bg-teal" : "bg-amber")} title={consentOk ? "Practice-record consent granted" : "Practice-record consent not granted"} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[12px] text-paper/70">Guest session</div>
                    <button onClick={() => startLogin()} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm bg-teal px-2 py-1.5 text-[12px] font-medium text-paper hover:bg-teal-dark">
                      <LogIn className="h-3.5 w-3.5" /> Sign in with Manus
                    </button>
                  </>
                )}
              </div>
              {isAuthenticated && (
                <button onClick={() => logout()} className="flex w-full items-center gap-2 px-1 py-1 text-[12px] text-paper/50 hover:text-paper">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              )}
              <p className="px-1 text-[10px] leading-relaxed text-paper/35">Practice ground for people who represent CodinCloud.</p>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1 lg:ml-[236px]">
            <div className="mx-auto w-full max-w-[1180px] px-5 py-8 md:px-8 md:py-10 lg:px-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AcademyContext.Provider>
  );
}

export function SignInGate({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="paper-card mx-auto max-w-xl px-8 py-12 text-center">
      <GraduationCap className="mx-auto mb-4 h-6 w-6 text-teal" />
      <h1 className="text-3xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-inkmuted">
        {children ?? "This part of the Academy stores your own practice records, so it needs a verified account."}
      </p>
      <button onClick={() => startLogin()} className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-soft">
        <LogIn className="h-4 w-4" /> Sign in with Manus
      </button>
      <p className="mt-3 text-[11px] text-inkmuted">Fictional training material only. No real customer or candidate data.</p>
    </div>
  );
}
