# Academy of CodinCloud Customer Service Agents

An open-source training SaaS for people who represent CodinCloud across customer service, sales, onboarding, technical support and after-sales conversations.

According to the project context, **أيمن الشايب (Aymen Chaieb)** is the owner of CodinCloud. Both spellings are intentional; do not replace them with a different transliteration such as “El Chayeb”. The Academy is also a practice environment for an independent English/French teacher who wants to train as a freelance technology-solution marketer and invite interested learners to try the exercises and share constructive feedback. Practice access does not by itself grant employment, agency or permission to make commercial commitments on CodinCloud's behalf.

## 500-simulation English challenge plus 500 French simulations

The first challenge pack contains 500 integrated English call simulations and 500 French simulations for dealing with extremely tough customers covering hostile procurement, security escalation, failed pilots, outage triage, integration boundaries, competitor and pricing pressure, vulnerable callers, ROI demands, renewal scope creep and cross-cultural handoffs. Every call is fictional training material. It never uses real customer, trainee or candidate data.

The Academy teaches evidence-led conversations around CodinCloud solutions including Vendeur.site, Dmagh.ai, Lanci.io and CodinCloud support services. The AI role-play is bounded by an administrator-approved product-fact baseline: it must not invent capabilities, prices, integrations, certifications, results or commitments. Formal scores, coaching and hiring decisions remain human.

The optional floating **Codie** coach provides multilingual practice for digital marketing, sales calls, ethical persuasion, active listening and five-star handling of resistant customers. Learners choose a chat language and receive tactics, sample phrases and respectful feedback; Codie is clearly labelled as an AI practice coach, not a human employee or commercial authoriser.

On landing, **Roued El Fadhel** is presented as an independent freelance marketing specialist and business developer who designed the Academy idea—not as a CodinCloud employee or authorised commercial representative. The welcome card offers Arabic, French and English choices, attempts a first-visit welcome playback when the browser permits autoplay and always provides a manual play button. Visitors can close the card with X and reopen it from Roued's portrait. Codie's assistant replies can be read aloud in the selected language through browser speech synthesis. The [Codie multilingual marketing playbook](docs/codie-marketing-playbook.md) contains 1,008 numbered practice lines across Arabic, English, French, German, Spanish, Italian and Russian.

The [AI-augmented digital-marketing course hub](client/src/pages/Courses.tsx) is the Academy's mega curriculum layer: Google search and measurement, LinkedIn B2B trust-building, content and SEO, AI-assisted campaign work, email/CRM follow-up, call-agent practice and the working [CodinCloud Vision charter](docs/codincloud-vision.md). The charter is intentionally labelled as a working training direction—not an official corporate policy—until an authorised owner approves it. The Academy does not ship or claim to train a literal one-gigabyte foundation model; it uses bounded AI coaching plus a large, inspectable curriculum so learners can understand and challenge the material.

## Arabic field manual

The project includes an Arabic manual for independent sales representatives, freelance marketers and Academy learners. It explains the verified product-positioning boundaries, ethical outreach, privacy rules and step-by-step use of the Academy without implying employment, agency, commission or guaranteed commercial results.

- [Read the Arabic manual (Markdown)](docs/دليل-العمل-واستخدام-الأكاديمية-بالعربية.md)
- [Download the Arabic manual (PDF)](docs/دليل-العمل-واستخدام-الأكاديمية-بالعربية.pdf)

## Languages

The English challenge pack is first. The same SaaS already has role-play language support for French, Spanish, German, Italian, Portuguese, Japanese, Chinese and Arabic, plus bilingual interview pathways. Localized challenge packs can be added without changing the assessment, consent, assignment or coaching model.

## Stack

React, TypeScript, Vite, Tailwind, Express, tRPC, Drizzle and managed MySQL. Audio uses managed object storage; durable records use the database.

## Local development

```bash
pnpm install
pnpm dev
```

This project is a training prototype. Do not enter real customer or candidate data.
