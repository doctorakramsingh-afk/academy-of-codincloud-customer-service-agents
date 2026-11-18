import { AcademyShell } from "@/components/academy/AcademyShell";
import { ArrowRight, BarChart3, BookOpen, Bot, CheckCircle2, Globe2, Linkedin, Mail, Search, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

const modules = [
  {
    number: "01",
    title: "Positioning without invention",
    channel: "CodinCloud products",
    icon: Target,
    color: "text-teal",
    lessons: ["Approved-fact discipline", "Value hypotheses vs. promises", "Choosing the right product conversation", "A respectful discovery call"],
    outcome: "Build a credible message around Vendeur.site, Dmagh.ai, Lanci.io or CodinCloud without making an unsupported claim.",
  },
  {
    number: "02",
    title: "Google search and measurement",
    channel: "Google · Search · Analytics",
    icon: Search,
    color: "text-[#b7791f]",
    lessons: ["Search intent and useful landing pages", "Keyword themes and negative assumptions", "UTM naming and consent-aware measurement", "Reading a funnel without overclaiming causality"],
    outcome: "Plan a measurable search experiment and explain what the data can—and cannot—prove.",
  },
  {
    number: "03",
    title: "LinkedIn trust-building",
    channel: "LinkedIn · B2B outreach",
    icon: Linkedin,
    color: "text-[#2867b2]",
    lessons: ["Executive-safe profile positioning", "Evidence-led posts and comments", "Permission-based outreach", "Handling a skeptical IT buyer"],
    outcome: "Start a professional conversation without spam, pressure, fake urgency or invented customer proof.",
  },
  {
    number: "04",
    title: "Content, SEO and social clarity",
    channel: "Web · Social · Community",
    icon: Globe2,
    color: "text-[#8d5aa7]",
    lessons: ["Problem-led content briefs", "Plain-language technical explanations", "Repurposing one insight across channels", "Community replies under pressure"],
    outcome: "Turn a real customer question into useful content that earns attention before asking for a sale.",
  },
  {
    number: "05",
    title: "AI-augmented campaign studio",
    channel: "AI · Prompting · Review",
    icon: Bot,
    color: "text-[#0f9d8a]",
    lessons: ["Prompting for audience research", "Human review and hallucination checks", "Multilingual adaptation", "Responsible automation boundaries"],
    outcome: "Use AI to accelerate drafts, variants and analysis while keeping humans accountable for truth, privacy and tone.",
  },
  {
    number: "06",
    title: "Email, CRM and the call handoff",
    channel: "Email · Follow-up · Calls",
    icon: Mail,
    color: "text-[#a33b2b]",
    lessons: ["Permission and preference", "A concise follow-up sequence", "From campaign signal to discovery call", "Five-star recovery after a difficult reply"],
    outcome: "Move from message to conversation with a named owner, a useful next step and no pressure tactics.",
  },
];

const standards = [
  [CheckCircle2, "Accuracy before excitement", "Only use approved facts. Mark product, pricing, integration, security and result questions for verification."],
  [Users, "Diplomacy under pressure", "Respect a CEO, buyer, engineer, vulnerable caller or skeptical customer equally. Tone is part of competence."],
  [TrendingUp, "Evidence over vanity", "Track a decision-relevant signal, define the baseline and avoid claiming causality from one number."],
  [BarChart3, "Human ownership", "AI can draft, compare and coach. A responsible representative reviews, approves and owns the final message."],
];

function openCodie() {
  document.getElementById("codie-launcher")?.click();
}

export default function Courses() {
  return (
    <AcademyShell>
      <div className="animate-rise">
        <header className="border-b border-line pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="eyebrow">CodinCloud Academy · AI-augmented school</div>
            <span className="stamp stamp-verified"><Sparkles className="h-3 w-3" /> Practice-led</span>
          </div>
          <div className="mt-6 max-w-4xl">
            <div className="rule-teal mb-5" />
            <h1 className="text-[42px] leading-[1.02] md:text-[62px]">Learn digital marketing like a <em className="font-normal italic text-teal-dark">responsible deal winner.</em></h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-inkmuted">A practical course hub for people who represent CodinCloud: Google search and measurement, LinkedIn trust-building, content, SEO, email, customer calls and AI-assisted campaign work. Learn the craft, practise the conversation, verify the claim.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={openCodie} className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-soft"><Bot className="h-4 w-4" /> Ask Codie to coach me</button>
              <a href="/codie-marketing-playbook.md" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm border border-line px-5 py-2.5 text-sm font-medium hover:bg-paper-2"><BookOpen className="h-4 w-4" /> Open 1,008-line playbook</a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 border-b border-line py-8 sm:grid-cols-3">
          <div className="paper-card p-5"><div className="eyebrow mb-2">Course tracks</div><div className="folio-number text-teal">06</div><p className="mt-2 text-xs leading-5 text-inkmuted">From approved product positioning to campaign measurement and customer conversations.</p></div>
          <div className="paper-card p-5"><div className="eyebrow mb-2">Practice languages</div><div className="folio-number text-teal">09</div><p className="mt-2 text-xs leading-5 text-inkmuted">Use Codie in Arabic, English, French, Spanish, German, Italian, Portuguese, Japanese or Chinese.</p></div>
          <div className="paper-card p-5"><div className="eyebrow mb-2">Human standard</div><div className="folio-number text-teal">5★</div><p className="mt-2 text-xs leading-5 text-inkmuted">Accuracy, empathy, privacy, diplomacy and ownership before speed or hype.</p></div>
        </section>

        <section className="py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><div className="eyebrow mb-2">Curriculum map</div><h2 className="text-[30px] leading-tight md:text-[38px]">Build the whole marketing motion.</h2></div>
            <span className="text-xs text-inkmuted">Self-paced · practice-first · fact-bounded</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {modules.map(module => {
              const Icon = module.icon;
              return <article key={module.number} className="paper-card group p-5 transition-colors hover:border-teal/50 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="folio-number text-[28px] text-teal">{module.number}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2"><Icon className={`h-4 w-4 ${module.color}`} /><span className="eyebrow">{module.channel}</span></div>
                    <h3 className="text-[22px] leading-tight">{module.title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-inkmuted">{module.outcome}</p>
                  </div>
                </div>
                <ul className="mt-5 grid gap-2 border-t border-line pt-4 text-[12px] text-inkmuted sm:grid-cols-2">{module.lessons.map(lesson => <li key={lesson} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />{lesson}</li>)}</ul>
                <button type="button" onClick={openCodie} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-teal-dark underline underline-offset-4">Practise this module with Codie <ArrowRight className="h-3.5 w-3.5" /></button>
              </article>;
            })}
          </div>
        </section>

        <section className="border-t border-line py-10">
          <div className="mb-6"><div className="eyebrow mb-2">The five-star operating standard</div><h2 className="text-[30px] leading-tight md:text-[38px]">AI augments judgement; it does not replace it.</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {standards.map(([Icon, title, body]) => { const StandardIcon = Icon as typeof CheckCircle2; return <div key={title as string} className="border-l border-line pl-4"><StandardIcon className="mb-4 h-5 w-5 text-teal" /><h3 className="text-[18px] leading-tight">{title as string}</h3><p className="mt-2 text-[12px] leading-6 text-inkmuted">{body as string}</p></div>; })}
          </div>
        </section>

        <section className="border-t border-line bg-paper-2/40 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="eyebrow mb-1">Ready to practise?</div><p className="text-sm leading-6 text-inkmuted">Choose a scenario, ask Codie for a tactic, then test it with a resistant customer. Formal assessment remains human.</p></div><Link href="/library" className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-teal px-4 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark">Open scenario library <ArrowRight className="h-4 w-4" /></Link></div>
        </section>
      </div>
    </AcademyShell>
  );
}
