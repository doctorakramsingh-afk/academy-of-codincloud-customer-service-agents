# CodinCloud Academy — implementation plan

## Product goal

A full-stack training SaaS that prepares future commercial, customer-care, contact-centre, onboarding, support and after-sales agents for CodinCloud products (Vendeur.site, Dmagh.ai, Lanci.io). Learners listen to real French simulation recordings, practise structured responses and bounded AI role-play, and are assessed by human coaches against a 100-point rubric. Prototype only: fictional training material, no real trainee or customer data, no automated hiring decisions.

## First release scope

1. **Role-based workspace.** Manus OAuth through the web-db-user starter. Academy roles: learner, coach, interviewer, administrator, enforced server-side. The first authenticated account bootstraps as administrator; everyone else starts as learner. Real logged-out state until OAuth succeeds.
2. **Scenario and audio library.** 18 scenarios: 14 French MP3 simulations (ten Vendeur.site sector calls, two Jacqueline resistance calls, two CodinCloud/Vendeur.site presentations) plus 4 text-only scenarios (Dmagh.ai/TechnoLamIA 10-minute call, Lanci.io discovery, vulnerable-customer support, bilingual interview). MP3s live in managed object storage (`/manus-storage/...`), never Git. Searchable metadata: product, sector, persona, spoken language, difficulty, competencies. Scenario page: audio player, brief, coaching focus, rubric, product-fact stamp.
3. **Practice.** Listen → structured written response → optional text AI role-play. Role-play languages: FR, EN, AR, DE, ES; interview pair alternates AR–FR, AR–EN or EN–FR. AI is blocked until an administrator approves the current product-fact baseline. The AI plays the customer/interviewer, never invents capabilities or makes commitments. AI coaching is advisory and is shared with a human coach only through a separate server-validated opt-in plus an administrator-seeded assignment.
4. **Assessment and interview readiness.** Assignments, attempts, rubric scores, coach notes, completion history, readiness summary. Coach and interviewer views are scoped to administrator-seeded cohorts. Formal feedback and hiring decisions remain human.
5. **Privacy and governance.** Visible consent with revocation for future records, self-service permanent deletion limited to the caller's own attempts, learner assignments and Academy profile; minimal actor-side audit events survive deletion; no real customer/candidate data; no model fine-tuning.
6. **Design.** Editorial learning cockpit (Swiss editorial systems design for a B2B learning workspace). Ink/navy, chalk/ivory, electric teal accent, amber reserved for review states. Narrow persistent left rail, broad editorial canvas, split reading/listening composition, numbered scenario folios, thin teal progress rule, verified/needs-review fact stamps, display serif + neutral sans, 150–220 ms transitions, no surprise autoplay.

## Architecture

- Frontend: React 19 + TypeScript + Vite + Tailwind 4 + wouter + tRPC React Query. `client/src/pages` (overview, library, scenario, practice, assignments, coach, interview, admin), `client/src/components/academy` (shell, folio list, audio player, rubric form, fact stamp, consent notice), `client/src/lib` (formatting, language labels, RTL helper).
- Backend: Express + tRPC with Zod validation. `server/academyRouter.ts` holds scenario, assignment, attempt, review, consent, role-play, admin and profile procedures. `server/academySeed.ts` seeds idempotently by slug.
- Persistence: managed MySQL via Drizzle. Tables: `academy_profiles`, `scenarios`, `media_assets`, `assignments`, `practice_attempts`, `rubric_scores`, `consent_records`, `product_facts`, `audit_events`. Additive migration `0001_academy.sql`.
- Auth: Manus OAuth (starter `server/_core/oauth.ts`), session cookie `webdev_app_session`, role checks in tRPC middleware.
- AI: starter `invokeLLM` helper (`server/_core/llm.ts`), server-side only.
- Media: `manus-upload-file --webdev` during build; stable `/manus-storage/<key>` addresses stored in `media_assets.storageKey`.

## Project structure

```
client/src/
  components/academy/   Shell, nav, folio card, audio player, rubric, stamps, consent
  pages/                Overview, Library, ScenarioDetail, Practice, Assignments, Coach, Interview, Admin
  lib/academy.ts        Labels, formatters, RTL helpers
server/
  academyRouter.ts      tRPC procedures
  academySeed.ts        Idempotent scenario + demo seed
  db.ts                 Drizzle client + user upsert
drizzle/schema.ts       Users + Academy tables
client/public/manus-routes.json
```

## Design direction

- **Design movement:** Swiss editorial systems design adapted to a contemporary B2B learning workspace.
- **Core principles:** legible at a glance; disciplined evidence; calm under pressure; respectful coaching.
- **Color philosophy:** deep ink/navy for trust, chalk/ivory for long reading, bright teal for progress and action; amber reserved for review-needed states, never alarm.
- **Layout paradigm:** narrow persistent left rail + broad editorial canvas; split reading/listening composition; ordered flows instead of dashboard tile grids.
- **Signature elements:** numbered scenario folios; thin teal progress rule; “verified / needs review” product-fact stamp.
- **Interaction philosophy:** clear states, reversible edits, explicit consent and review, keyboard-accessible controls, no surprise autoplay.
- **Animation:** 150–220 ms transitions for navigation and progress; no looping movement or animated score effects.
- **Typography system:** Fraunces (display serif) for headlines, Inter (neutral sans) for interface; system fallbacks.
- **Brand essence:** “A practice ground for people who represent CodinCloud” — precise, humane, ambitious.
- **Brand voice:** direct, calm, evidence-led. “Practice the hard conversation before it happens.” “Know what is proven, what needs review, and what comes next.”
- **Wordmark & logo:** compact CC monogram formed by two interlocking conversation brackets with an “Academy” label.
- **Signature brand color:** electric teal (#0F9D8A), used sparingly for actionable learning progress.
