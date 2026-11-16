import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  academyProfiles,
  assignments,
  auditEvents,
  consentRecords,
  mediaAssets,
  practiceAttempts,
  productFacts,
  rubricScores,
  scenarios,
  users,
} from "../drizzle/schema";

const RUBRIC = [
  { key: "accuracy", label: "Product accuracy & mastery", max: 20, observable: "Verified facts, named uncertainties, no improvised promise" },
  { key: "discovery", label: "Discovery & listening", max: 15, observable: "Useful open questions, reformulation, respect for the client's time" },
  { key: "relevance", label: "Commercial relevance / solution quality", max: 15, observable: "Clear link between need and next step; knows how to disqualify" },
  { key: "demo", label: "Demo / technical explanation", max: 15, observable: "Targeted scenario, controls and limits explained" },
  { key: "relationship", label: "Relationship management", max: 10, observable: "Calm, natural, respectful with a demanding client" },
  { key: "closing", label: "Closing / ownership", max: 10, observable: "Next action, owner and date confirmed" },
  { key: "security", label: "Security, privacy & compliance", max: 10, observable: "Minimised data, protected identity, correct escalation" },
  { key: "documentation", label: "Documentation & language", max: 5, observable: "Useful notes, clear language adapted to the client's preference" },
];

type ScenarioSeed = {
  slug: string;
  folio: number;
  title: string;
  product: string;
  sector: string;
  persona: string;
  difficulty: "starter" | "intermediate" | "advanced" | "expert";
  modality: "audio" | "text";
  language?: string;
  languagePair?: string;
  summary: string;
  brief: string;
  coachingFocus: string;
  competencies: string[];
  file?: string;
  duration?: number;
};

const SECTORS: ScenarioSeed[] = [
  {
    slug: "fashion-boutique", folio: 1, title: "Boutique de mode — the owner questions delivery times",
    product: "Vendeur.site", sector: "Fashion & ready-to-wear", persona: "Sonia, owner of a fashion boutique in Tunis",
    difficulty: "starter", modality: "audio", file: "01_fashion_e53c2427.mp3", duration: 88,
    summary: "A first call with a boutique owner who already sells on social media and wants a credible online store without losing her brand.",
    brief: "Sonia sells through Instagram DMs and wants a storefront she can run herself. She is warm but impatient: her last provider disappeared after launch. Open with permission, discover her order volume and delivery reality, then position Vendeur.site only on capabilities that are confirmed in the approved fact sheet. End with a concrete next step and a named owner.",
    coachingFocus: "Discovery before pitch. Name what is confirmed versus what must be checked with the product owner. Do not promise a launch date.",
    competencies: ["Discovery", "Objection handling", "Next-step clarity"],
  },
  {
    slug: "cosmetics-stock", folio: 2, title: "Cosmetics — stock visibility across two sales channels",
    product: "Vendeur.site", sector: "Beauty & cosmetics", persona: "Ines, co-founder of a cosmetics brand selling online and in two salons",
    difficulty: "intermediate", modality: "audio", file: "02_cosmetics_7e6dd5fe.mp3", duration: 96,
    summary: "A co-founder needs one view of stock across a web shop and two salons; she has been burned by a custom build.",
    brief: "Ines compares every option to the spreadsheet her team uses today. Discover how stock is reconciled, who updates it, and what happens when a product sells out in one channel. Explain only confirmed Vendeur.site capabilities and propose a bounded validation step. Never guarantee real-time synchronisation unless it is approved in the fact baseline.",
    coachingFocus: "Translate an operational pain into a measurable criterion, then agree how it would be tested.",
    competencies: ["Technical discovery", "Evidence-led claims", "Scope control"],
  },
  {
    slug: "grocery-delivery", folio: 3, title: "Grocery — delivery slots and cash-on-delivery",
    product: "Vendeur.site", sector: "Grocery & local retail", persona: "Hédi, owner of a neighbourhood grocery with a growing WhatsApp order list",
    difficulty: "starter", modality: "audio", file: "03_grocery_762227de.mp3", duration: 76,
    summary: "A neighbourhood grocer wants to stop losing WhatsApp orders, with cash-on-delivery and tight delivery slots.",
    brief: "Hédi is practical and price-sensitive. He cares about delivery slots, cash-on-delivery and a simple interface for his two helpers. Ask about his daily order volume and peak hours before showing anything. If a requested capability is conditional, say so and offer to verify. Close on a small, dated next step.",
    coachingFocus: "Respect the client's operating reality; avoid feature dumping; confirm the next action in his words.",
    competencies: ["Needs qualification", "Pricing boundaries", "Closing"],
  },
  {
    slug: "electronics-warranty", folio: 4, title: "Electronics — warranty claims and serial numbers",
    product: "Vendeur.site", sector: "Consumer electronics", persona: "Karim, manager of an electronics shop with high after-sales volume",
    difficulty: "intermediate", modality: "audio", file: "04_electronics_80f06962.mp3", duration: 94,
    summary: "An electronics retailer wants warranty claims and serial numbers tracked without adding work for his team.",
    brief: "Karim is sceptical: every tool he tried created more admin. Discover how warranty claims are handled today, who touches the record, and what evidence he needs. Discuss only confirmed order and after-sales capabilities. If serial-number tracking is not approved, say it must be verified rather than implying it exists.",
    coachingFocus: "After-sales ownership: show how a case stays owned until resolution, without inventing integrations.",
    competencies: ["After-sales thinking", "Product boundaries", "Process discovery"],
  },
  {
    slug: "furniture-showroom", folio: 5, title: "Furniture — showroom visit becomes an online order",
    product: "Vendeur.site", sector: "Furniture & home", persona: "Nadia, owner of a furniture showroom with high-ticket items",
    difficulty: "intermediate", modality: "audio", file: "05_furniture_eeedb68c.mp3", duration: 80,
    summary: "High-ticket furniture buyers still want to see the product in person; the owner wants the website to support, not replace, the showroom.",
    brief: "Nadia's average order is large and her clients ask for fabric samples and delivery dates. Discover the path from first visit to deposit, then position the website as a showroom companion. Be explicit about what is not confirmed (payment plans, delivery scheduling) and propose a follow-up with the right owner.",
    coachingFocus: "Value framing for a considered purchase; honest boundaries on payments and logistics.",
    competencies: ["Value selling", "Honest boundaries", "Stakeholder mapping"],
  },
  {
    slug: "artisanat-marketplace", folio: 6, title: "Artisanat — a cooperative wants a shared shopfront",
    product: "Vendeur.site", sector: "Artisanat & crafts", persona: "Fatma, coordinator of a 14-artisan cooperative",
    difficulty: "advanced", modality: "audio", file: "06_artisanat_59b051e4.mp3", duration: 88,
    summary: "A cooperative needs one storefront for fourteen artisans, each with their own catalogue and payout expectations.",
    brief: "Fatma speaks for the group and worries about who controls each artisan's page. Discover the governance model, who ships, and how money would be split. Do not promise multi-vendor payouts unless approved. Offer a scoped workshop with the coordinator and two artisans to test the operating model.",
    coachingFocus: "Multi-stakeholder discovery; do not let a group need become an invented product promise.",
    competencies: ["Multi-stakeholder discovery", "Governance", "Workshop closing"],
  },
  {
    slug: "sports-club", folio: 7, title: "Sports — club shop and member pre-orders",
    product: "Vendeur.site", sector: "Sports & clubs", persona: "Mehdi, manager of a local sports club",
    difficulty: "starter", modality: "audio", file: "07_sports_bb0f900d.mp3", duration: 85,
    summary: "A club wants a shop for jerseys and pre-orders around match days, with volunteer staff.",
    brief: "Mehdi has no e-commerce experience and a volunteer team. Keep the language concrete, discover how kit orders are taken today, and focus on a first useful outcome rather than a full catalogue. Confirm who would own the shop day to day.",
    coachingFocus: "Plain-language explanation; adoption and ownership planning for non-specialists.",
    competencies: ["Simplicity", "Adoption planning", "Ownership"],
  },
  {
    slug: "pet-supplies", folio: 8, title: "Pet supplies — subscriptions and repeat orders",
    product: "Vendeur.site", sector: "Pet supplies", persona: "Rym, owner of a pet-supply shop with loyal repeat customers",
    difficulty: "intermediate", modality: "audio", file: "08_pet_42ae94aa.mp3", duration: 94,
    summary: "A pet shop wants recurring food orders without chasing customers every month.",
    brief: "Rym's customers already reorder by phone. Discover the repeat-order pattern and what happens when a product is out of stock. Recurring billing is a capability that must be confirmed in the fact baseline; if it is not approved, say so and discuss a reminder-based alternative.",
    coachingFocus: "Distinguish a confirmed capability from a roadmap item; offer a safe alternative.",
    competencies: ["Recurring revenue", "Product truth", "Alternatives"],
  },
  {
    slug: "autoparts-catalogue", folio: 9, title: "Auto parts — compatibility and a very large catalogue",
    product: "Vendeur.site", sector: "Automotive parts", persona: "Bilel, owner of an auto-parts counter",
    difficulty: "advanced", modality: "audio", file: "09_autoparts_449ba4a2.mp3", duration: 93,
    summary: "An auto-parts seller needs buyers to find the right part the first time, with a catalogue of thousands of references.",
    brief: "Bilel's customers arrive with a vehicle model and a part number. Discover how compatibility is checked today and how many references he holds. Ask for a sample of his data before discussing catalogue size. Do not promise an automatic compatibility engine; propose a bounded data review.",
    coachingFocus: "Technical credibility; data-first discovery; no invented automation.",
    competencies: ["Technical discovery", "Data literacy", "Pilot design"],
  },
  {
    slug: "wholesale-b2b", folio: 10, title: "Wholesale — B2B pricing for resellers",
    product: "Vendeur.site", sector: "Wholesale & distribution", persona: "Slim, commercial director of a wholesale distributor",
    difficulty: "expert", modality: "audio", file: "10_wholesale_decf7ae9.mp3", duration: 87,
    summary: "A distributor wants reseller-specific pricing and order minimums without exposing retail margins.",
    brief: "Slim is evaluating three vendors and asks precise questions about B2B price lists, minimum order quantities and credit terms. Answer only from the approved fact sheet. Where a capability is conditional, name the verification owner and a realistic date. Close with a mutual next step, not a discount.",
    coachingFocus: "Prestige client protocol: direct answers, no invented numbers, no unauthorised discount, clear ownership.",
    competencies: ["Pricing boundaries", "Negotiation", "Executive presence"],
  },
];

const CALLS: ScenarioSeed[] = [
  {
    slug: "jacqueline-vendeur", folio: 11, title: "Jacqueline — technical director challenges Vendeur.site",
    product: "Vendeur.site", sector: "Smart home & technical distribution", persona: "Jacqueline, technical director of a smart-home solutions company",
    difficulty: "expert", modality: "audio", file: "Appel_Raoued_Jacqueline_VendeurSite_FR_d09ca428.mp3", duration: 249,
    summary: "A technical director with a successful track record tests whether the caller understands architecture, integration and support.",
    brief: "Jacqueline is courteous and extremely precise. She asks for proof of integration and refuses generalities. Discover her current pre-sales or support flow, ask about architecture and protocols only when necessary, and propose a validation workshop without assuming compatibility with KNX, Matter, Zigbee or any manufacturer. Never claim a certification you cannot evidence.",
    coachingFocus: "Critical error to avoid: asserting a technical integration without proof. Recognise expertise without flattery.",
    competencies: ["Technical credibility", "Objection handling", "Security & privacy"],
  },
  {
    slug: "jacqueline-codincloud", folio: 12, title: "Jacqueline — from resistance to a bounded next step",
    product: "CodinCloud", sector: "Smart home & IT solutions", persona: "Jacqueline, owner and technical director of a smart-home integrator",
    difficulty: "expert", modality: "audio", file: "Appel_CodinCloud_Raoued_Jacqueline_FR_final_9e0e70be.mp3", duration: 197,
    summary: "A second, harder conversation: the client has results, doubts the value of another platform, and will not accept a generic pitch.",
    brief: "Jacqueline opens by challenging the caller's right to take her time. Stay calm, acknowledge her results without inventing metrics, and ask what her next objective is. Link only confirmed CodinCloud capabilities to that objective. The call may end with no purchase — that is acceptable if ownership and a next step are clear, or if a respectful no is recorded.",
    coachingFocus: "Handle resistance without confrontation; do not invent metrics or testimonials; respect a no.",
    competencies: ["Executive presence", "Discovery", "Respectful disqualification"],
  },
];

const PRESENTATIONS: ScenarioSeed[] = [
  {
    slug: "codincloud-positioning", folio: 13, title: "CodinCloud — five-minute positioning pitch",
    product: "CodinCloud", sector: "AI & digital solutions", persona: "A room of partners and prospective clients",
    difficulty: "intermediate", modality: "audio", file: "Presentation_Raoued_CodinCloud_FR_4d717a89.mp3", duration: 282,
    summary: "A first-person French pitch covering CodinCloud's vision, the product portfolio and the next step.",
    brief: "Listen to the full pitch, then deliver your own version in five minutes. Open with a verified reason to listen, move from problem to capability, and close with a single clear invitation. Do not include pronunciation notes or internal remarks in the spoken text.",
    coachingFocus: "Structure and pacing; evidence-led claims; a close that invites a conversation rather than a signature.",
    competencies: ["Storytelling", "Product truth", "Closing"],
  },
  {
    slug: "vendeur-site-pitch", folio: 14, title: "Vendeur.site — sixty-second elevator pitch",
    product: "Vendeur.site", sector: "E-commerce", persona: "A busy shop owner met at a trade fair",
    difficulty: "starter", modality: "audio", file: "Raoued_VendeurSite_Presentation_FR_a2fd2d73.mp3", duration: 57,
    summary: "A compact pitch to earn a second conversation, not to close a sale.",
    brief: "Listen once, then deliver a 60-second version adapted to a specific shop owner you choose. Earn permission for a follow-up with one concrete question. No feature list, no invented results.",
    coachingFocus: "Brevity and relevance; one idea, one proof, one question.",
    competencies: ["Brevity", "Relevance", "Permission"],
  },
];

const TEXT_SCENARIOS: ScenarioSeed[] = [
  {
    slug: "dmagh-technolamia", folio: 15, title: "Dmagh.ai — the ten-minute call with Lemya of TechnoLamIA",
    product: "Dmagh.ai", sector: "Web development & IT solutions", persona: "Lemya, owner of fictional TechnoLamIA, offering AI augmentation and web security",
    difficulty: "expert", modality: "audio", file: "Dmagh_TechnoLamIA_Appel_FR_v2_4ce9b6e5.mp3", duration: 600,
    summary: "A ten-minute French negotiation with a highly resistant technical founder that ends in a bounded Solo-plan close.",
    brief: "Lemya runs a web-development and IT-security company. She is exceptionally resistant and has seen many AI pitches. Roued El Fadhel, CodinCloud's marketing manager, must sustain ten minutes of technical and commercial objections without inventing a certification, a data-residency guarantee, an ROI figure or a superiority claim. The published Solo offer is 49 EUR HT per month for one seat; quotas, model costs, support and renewal terms must be confirmed in writing. The call ends with Lemya accepting one Solo seat for a thirty-day internal evaluation on a scrubbed repository, with no client code, no production access and a written security checklist.",
    coachingFocus: "Sustain a ten-minute negotiation under pressure; separate published facts from claims that require verification; earn a bounded close without overselling or chasing.",
    competencies: ["Long-form discovery", "Security literacy", "Objection handling", "Bounded closing"],
  },
  {
    slug: "lanci-discovery", folio: 16, title: "Lanci.io — connecting agents to business tools",
    product: "Lanci.io", sector: "AI tooling & integration", persona: "Omar, platform lead at a mid-sized services company",
    difficulty: "advanced", modality: "text",
    summary: "A platform lead wants to connect internal agents to business tools without opening a security hole.",
    brief: "Omar's team already runs several agents and is wary of tool sprawl. Use the public Lanci.io description — an MCP marketplace connecting agents to business tools and isolated workspaces — and do not add certifications or integrations. Discover which tools matter first, who approves access, and what isolation would need to mean for his security team. Propose a bounded technical review.",
    coachingFocus: "Security-first discovery; scope a review rather than promising an integration.",
    competencies: ["Security literacy", "Technical discovery", "Pilot design"],
  },
  {
    slug: "vulnerable-customer", folio: 17, title: "Vulnerable customer — a distressed client and a failed payment",
    product: "CodinCloud", sector: "Customer care", persona: "Mme Salma, 71, whose online order failed and who is close to tears",
    difficulty: "advanced", modality: "text",
    summary: "A delicate support conversation: an older customer, a failed payment, and a risk of financial harm.",
    brief: "Mme Salma believes she was charged twice and cannot find her order confirmation. She is distressed and hard of hearing. Speak slowly, confirm understanding, never ask for a password or full card number, and explain only what you can verify. Escalate the payment concern to the authorised team, give a realistic update time, and stay the owner until a handover is accepted.",
    coachingFocus: "Vulnerable-customer care, data minimisation, correct escalation and ownership.",
    competencies: ["Empathy", "Data protection", "Escalation"],
  },
  {
    slug: "bilingual-interview", folio: 18, title: "Bilingual interview — Arabic and French, alternating turns",
    product: "CodinCloud", sector: "Interview readiness", persona: "A hiring interviewer assessing a customer-care candidate",
    difficulty: "advanced", modality: "text", languagePair: "ar-fr",
    summary: "A structured interview that alternates Arabic and French to test comprehension, reformulation and professional register in both languages.",
    brief: "The interviewer asks one question at a time, alternating between Modern Standard Arabic and French. Answer in the language of the question. Cover a difficult client, a security incident, a pricing objection and a next-step commitment. An accent is never a quality criterion; comprehension and precision are.",
    coachingFocus: "Bilingual fluency under pressure; structured answers; no improvisation on security or pricing.",
    competencies: ["Arabic", "French", "Interview readiness"],
  },
];


const MULTILINGUAL_SALES: ScenarioSeed[] = [
  {
    slug: "sales-de-vendeur", folio: 19, title: "Vendeur.site — Verkaufsgespräch mit einem deutschen Händler",
    product: "Vendeur.site", sector: "CodinCloud sales call center", persona: "Klara, Inhaberin eines deutschen Concept Stores",
    language: "de", difficulty: "intermediate", modality: "text",
    summary: "Ein deutschsprachiges Verkaufsgespräch über einen KI-gestützten Online-Shop und zentrale Kundenkanäle.",
    brief: "Klara verkauft heute über Instagram und E-Mail. Sie möchte einen Online-Shop, ein gemeinsames Postfach und bessere Übersicht über Produkte und Bestellungen. Führe das Gespräch auf Deutsch: erst Bedarf und Prozess klären, dann nur bestätigte Vendeur.site-Funktionen nennen. Keine Zusage zu deutschen Zahlungsanbietern, Lieferzeiten oder Echtzeit-Synchronisation ohne Prüfung. Schließe mit einem begrenzten nächsten Schritt.",
    coachingFocus: "Auf Deutsch präzise entdecken, Nutzen mit belegten Funktionen verbinden und offene Punkte sauber markieren.",
    competencies: ["German sales", "Discovery", "Product truth"],
  },
  {
    slug: "sales-en-dmagh", folio: 20, title: "Dmagh.ai — English discovery call with a technical buyer",
    product: "Dmagh.ai", sector: "CodinCloud sales call center", persona: "Jordan, engineering manager at a software company",
    language: "en", difficulty: "advanced", modality: "text",
    summary: "An English discovery call about agent workflows, permissions, connected machines and CI/CD review.",
    brief: "Jordan already uses a coding assistant and challenges every security claim. Explain Dmagh.ai only from the approved baseline: dmagh-code runs its agent loop on the installed machine; the ecosystem connects teams, machines and automations; public materials describe terminal, web canvas, editor, mobile and CI/CD surfaces. Never promise data residency, a certification, an ROI figure or autonomous production deployment. Ask what workflow is worth validating and agree an evidence-based next step.",
    coachingFocus: "Technical credibility in English: distinguish architecture, current availability and verification requirements.",
    competencies: ["English sales", "Technical discovery", "Security literacy"],
  },
  {
    slug: "sales-es-vendeur", folio: 21, title: "Vendeur.site — llamada en español con una tienda multicanal",
    product: "Vendeur.site", sector: "CodinCloud sales call center", persona: "Lucía, gerente de una tienda de cosmética que vende por redes sociales",
    language: "es", difficulty: "intermediate", modality: "text",
    summary: "Una llamada en español para entender pedidos, mensajes y entregas antes de proponer una tienda online.",
    brief: "Lucía recibe mensajes por Instagram, WhatsApp y Facebook y pierde tiempo copiando pedidos. Descubre su proceso, volumen y responsables antes de presentar Vendeur.site. Puedes hablar de creador de sitios, bandeja multicanal y gestión de productos y pedidos según la información pública. No prometas integraciones de pago, inventario en tiempo real ni plazos de lanzamiento sin confirmación. Termina con una prueba de alcance limitado y un responsable.",
    coachingFocus: "Venta consultiva en español: escuchar el flujo real y no convertir una lista de funciones en una promesa.",
    competencies: ["Spanish sales", "Omnichannel discovery", "Next-step clarity"],
  },
  {
    slug: "sales-it-dmagh", folio: 22, title: "Dmagh.ai — chiamata italiana con un responsabile IT",
    product: "Dmagh.ai", sector: "CodinCloud sales call center", persona: "Marco, responsabile IT di una società di servizi",
    language: "it", difficulty: "advanced", modality: "text",
    summary: "Una chiamata in italiano su agenti di sviluppo, autorizzazioni e automazioni senza promesse non verificate.",
    brief: "Marco teme che un agente possa eseguire azioni oltre i permessi approvati. Conduci la chiamata in italiano. Spiega che la documentazione pubblica descrive una boucle dell'agente sulla macchina installata, permessi per azione e collegamenti a team, macchine e automazioni; chiarisci che ogni configurazione deve essere verificata. Non promettere certificazioni, sovranità dei dati, risparmi o deploy autonomi. Concorda una revisione tecnica circoscritta.",
    coachingFocus: "Gestire obiezioni tecniche in italiano, nominando limiti e proprietari della verifica.",
    competencies: ["Italian sales", "Objection handling", "Technical boundaries"],
  },
  {
    slug: "sales-ja-vendeur", folio: 23, title: "Vendeur.site — 日本語の販売相談、店舗オーナーとの初回電話",
    product: "Vendeur.site", sector: "CodinCloud sales call center", persona: "美咲、SNSで商品を販売する小売店オーナー",
    language: "ja", difficulty: "intermediate", modality: "text",
    summary: "店舗運営の流れを聞き、Vendeur.siteを誇張せずに紹介する日本語の営業電話です。",
    brief: "美咲はInstagramとメッセージで注文を受けていますが、注文と配送の確認に時間がかかっています。日本語で丁寧に許可を取り、現在の業務、注文数、担当者を確認してください。Vendeur.siteのサイト作成、複数チャネルの受信箱、商品・注文・配送管理は公開情報に基づいて説明できます。決済、在庫同期、導入日を確認なしに約束しないでください。小さな次の検証を提案します。",
    coachingFocus: "日本語の丁寧な営業と、確認済みの機能と未確認事項の区別。",
    competencies: ["Japanese sales", "Polite discovery", "Scope control"],
  },
  {
    slug: "sales-zh-codincloud", folio: 24, title: "CodinCloud — 中文客户中心销售电话：先了解业务，再介绍方案",
    product: "CodinCloud", sector: "CodinCloud sales call center", persona: "李娜，一家成长型零售企业的运营负责人",
    language: "zh", difficulty: "advanced", modality: "text",
    summary: "中文销售电话，了解电商、客户支持和技术协作需求，再选择合适的 CodinCloud 产品方向。",
    brief: "李娜同时关心线上销售、客户消息和内部技术自动化。用中文进行一次结构化发现：先确认她的业务流程、团队和优先问题，再说明 CodinCloud 可以提供 IT 解决方案，并区分 Vendeur.site 的电商与多渠道管理方向和 Dmagh.ai 的开发代理与自动化方向。不要承诺价格、交付时间、认证或具体集成。最后确定一个有范围、有负责人、有日期的评估步骤。",
    coachingFocus: "中文电话销售中的需求分流：不要过早选产品，也不要把公司定位说成未经批准的承诺。",
    competencies: ["Chinese sales", "Needs qualification", "Portfolio positioning"],
  },
  {
    slug: "sales-pt-vendeur", folio: 25, title: "Vendeur.site — chamada em português com uma marca de comércio online",
    product: "Vendeur.site", sector: "CodinCloud sales call center", persona: "Rafael, fundador de uma marca que vende por mensagens e marketplace",
    language: "pt", difficulty: "intermediate", modality: "text",
    summary: "Uma chamada em português sobre loja online, caixa de entrada multicanal, pedidos e entregas.",
    brief: "Rafael recebe pedidos no Instagram, WhatsApp e marketplace e não tem uma visão única dos clientes. Conduza a conversa em português, começando pelo processo atual e pelo volume de pedidos. Apresente apenas o que a página pública confirma sobre criação de loja, caixa de entrada multicanal, produtos, pedidos, clientes, entregas e analytics. Não invente gateways, prazos, suporte ou resultados. Feche com uma demonstração ou revisão de dados com escopo definido, sem exigir compra.",
    coachingFocus: "Venda consultiva em português, com linguagem clara e compromisso comercial limitado.",
    competencies: ["Portuguese sales", "Multichannel discovery", "Ethical closing"],
  },
  {
    slug: "sales-fr-codincloud", folio: 26, title: "CodinCloud — appel français pour une solution IT complète",
    product: "CodinCloud", sector: "CodinCloud sales call center", persona: "Nour, directrice des opérations d'une PME en croissance",
    language: "fr", difficulty: "advanced", modality: "text",
    summary: "Un appel français qui relie besoin commercial, support vendeur et automatisation technique sans faire de promesse globale.",
    brief: "Nour cherche à mieux accompagner ses vendeurs en ligne et à réduire les tâches techniques répétitives. Conduis l'appel en français. Clarifie d'abord si le besoin relève de Vendeur.site (site, messages, produits, commandes, livraisons, analytics) ou de Dmagh.ai (agent de développement, machines, automatisations et CI/CD). Ne promets ni résultat, ni certification, ni intégration, ni délai sans validation. Conclus avec un diagnostic limité et un propriétaire côté CodinCloud.",
    coachingFocus: "Positionnement portefeuille en français : orienter sans noyer le client dans les produits.",
    competencies: ["French sales", "Portfolio discovery", "Executive communication"],
  },
];


const CHALLENGE_AUDIO: Record<string, { file: string; duration: number }> = {
  "001": { file: "challenge-call-001_d2938eb4.mp3", duration: 52 },
  "002": { file: "challenge-call-002_522bae06.mp3", duration: 44 },
  "003": { file: "challenge-call-003_71d6510f.mp3", duration: 43 },
  "004": { file: "challenge-call-004_6ca9b797.mp3", duration: 43 },
  "005": { file: "challenge-call-005_4fd538b9.mp3", duration: 49 },
  "006": { file: "challenge-call-006_6f2a5172.mp3", duration: 39 },
  "007": { file: "challenge-call-007_2fb1eb50.mp3", duration: 43 },
  "008": { file: "challenge-call-008_cc2f32c9.mp3", duration: 36 },
  "009": { file: "challenge-call-009_57cd96bb.mp3", duration: 45 },
  "010": { file: "challenge-call-010_9e2f4155.mp3", duration: 48 },
  "011": { file: "challenge-call-011_f4c1e072.mp3", duration: 45 },
};

const CHALLENGE_CALLS: ScenarioSeed[] = Array.from({ length: 100 }, (_, index) => {
  const n = index + 1;
  const number = String(n).padStart(3, "0");
  const products = ["Vendeur.site", "Dmagh.ai", "CodinCloud", "Lanci.io"];
  const sectors = ["retail operations", "SaaS engineering", "customer support", "online marketplace", "professional services"];
  const themes = [
    { name: "The hostile procurement lead", persona: "a procurement lead who interrupts every answer", issue: "demands a final price and a signed implementation date before sharing any context", focus: "slow down the pressure, qualify authority and separate discovery from commercial commitment" },
    { name: "The security escalation", persona: "a security director who assumes the worst", issue: "asks for certifications, data-residency guarantees and a written threat model", focus: "acknowledge the concern, state only approved facts and create a technical validation path" },
    { name: "The failed pilot", persona: "a disappointed operations manager", issue: "says a previous software pilot wasted six weeks and refuses another generic demo", focus: "rebuild trust with a bounded diagnostic, measurable evidence and a named owner" },
    { name: "The angry outage call", persona: "a customer who believes a live business process is blocked", issue: "demands an immediate fix while the agent cannot verify the incident or account", focus: "show empathy, protect account data, triage safely and own the handover" },
    { name: "The impossible integration", persona: "a technical buyer with a long integration checklist", issue: "requires an unconfirmed connector, custom workflow and guaranteed migration", focus: "map requirements, label unknowns and propose the smallest evidence-based test" },
    { name: "The price and competitor trap", persona: "a founder comparing three vendors on a recorded call", issue: "asks you to disparage a competitor and match an unapproved discount", focus: "stay respectful, uncover decision criteria and never invent pricing or superiority" },
    { name: "The vulnerable caller", persona: "a stressed customer who struggles to follow technical language", issue: "is worried about a payment, privacy or access problem and wants you to bypass verification", focus: "use plain language, minimise data, verify safely and escalate without abandonment" },
    { name: "The executive ROI challenge", persona: "a CFO who wants a guaranteed return in ninety days", issue: "will approve only a quantified outcome and asks for a customer reference you cannot provide", focus: "translate value into testable hypotheses without promising ROI or fabricating references" },
    { name: "The scope-creep renewal", persona: "an existing customer asking for a larger renewal", issue: "bundles five new requirements into a renewal call and expects them all to be included", focus: "recognise the relationship, separate current facts from roadmap and define a review backlog" },
    { name: "The cross-cultural handoff", persona: "a global team with different expectations about urgency and ownership", issue: "switches terminology mid-call and blames the previous agent for an unclear next step", focus: "reformulate, confirm understanding, document ownership and close with a precise follow-up" },
  ];
  const theme = themes[index % themes.length];
  const product = products[index % products.length];
  const sector = sectors[index % sectors.length];
  return {
    slug: `challenge-call-${number}`,
    folio: 26 + n,
    title: `Call ${number} — ${theme.name}: ${product}`,
    product,
    sector: `CodinCloud challenge call · ${sector}`,
    persona: theme.persona,
    language: "en",
    difficulty: "expert",
    modality: "text",
    summary: `A high-pressure English ${product} call designed to test safe discovery, product truth and human ownership.`,
    brief: `This is challenge call ${number} in the CodinCloud 100-call English track. The customer ${theme.issue}. You are the CodinCloud customer-service or sales agent. Start by establishing what is known, what the caller needs now and what you are authorised to do. Use only the approved product baseline for ${product}; never invent a feature, integration, price, certification, result, timeline or customer reference. ${theme.focus}. End with a concise recap, a named owner and a realistic next step.`,
    coachingFocus: `Expert practice: ${theme.focus}. The formal assessment remains human and rewards accuracy, empathy, boundaries and ownership over a fast pitch.`,
    competencies: ["English customer service", "High-pressure discovery", "Product truth", "Escalation", "Ownership"],
    file: CHALLENGE_AUDIO[number]?.file,
    duration: CHALLENGE_AUDIO[number]?.duration,
  };
});

const FACTS = [
  {
    product: "CodinCloud",
    version: "v1.1",
    content: `APPROVED FACTS (public positioning, 2026-11). CodinCloud presents itself as an IT and digital-solutions company supporting online sellers and businesses with e-commerce, technical support, marketing and website development. Its public portfolio includes Vendeur.site for commerce, Dmagh.ai for AI-assisted development and orchestration, and Lanci.io for agent workspaces and MCP tools. CodinCloud describes seller and client portals plus ticketing for communication and support.
DO NOT CLAIM without written confirmation: a guaranteed outcome, SLA, certification, named client reference, delivery date, discount, contract term, security posture beyond the product's public wording, or a capability belonging to another CodinCloud product.`,
  },
  {
    product: "Vendeur.site",
    version: "v1.1",
    content: `APPROVED FACTS (public positioning, 2026-11). Vendeur.site publicly presents an AI-assisted site builder for online stores, a multi-channel inbox for Messenger, Instagram, WhatsApp and Marketplace, and management for products, stock, orders, customers, employees and couriers. Its public page also describes TunisiaShip shipping, analytics and RFM segmentation, CSV exports, version restoration, custom domains, and an AI studio that can edit a store conversationally. Public pricing shown is Starter free, Pro 49 TND/month and Business contact us; the current price and terms must still be confirmed before quoting.
TO CONFIRM WITH THE PRODUCT OWNER: any payment provider beyond what the current product page states, exact delivery or stock-sync behavior, multi-vendor payout details, customer-specific data handling, launch dates, discounts, SLAs or guaranteed conversion/results. Never present a roadmap item as live.`,
  },
  {
    product: "Dmagh.ai",
    version: "v1.1",
    content: `APPROVED FACTS (public positioning, 2026-11). Dmagh.ai publicly presents dmagh-code as a programming agent whose agent loop — tools, permissions and sessions — runs on the machine where it is installed, while the model produces text. The ecosystem connects teams, machines and automations and presents terminal, web canvas, VS Code/editor, mobile and assistant surfaces. Public materials describe automations, approval requests, MCP packs and dmagh ci for pull-request review, failed-check repair and failure analysis, with SARIF, Code Quality and PR-comment outputs. Some surfaces are labelled Soon or In preparation and must not be sold as available.
DO NOT CLAIM: a security certification, absolute data residency, a specific model provider, exact model costs, ROI, performance, autonomous production authority or a capability marked Soon/In preparation. Security and compliance questions require technical and legal validation with a named owner and date.`,
  },
  {
    product: "Lanci.io",
    version: "v1.1",
    content: `APPROVED FACTS (public positioning, 2026-11). Lanci.io is presented publicly as an MCP marketplace that connects agents to business tools and provides isolated workspaces.
DO NOT CLAIM: a specific list of supported tools, certifications, data-residency guarantees or prices. Any integration claim requires confirmation from the product owner.`,
  },
];

function rubricJson() {
  return JSON.stringify(RUBRIC);
}

export async function seedAcademy() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is required to seed");

  // Scenarios + media — insert missing slugs so later catalogue expansions are safe.
  const all = [...SECTORS, ...CALLS, ...PRESENTATIONS, ...TEXT_SCENARIOS, ...MULTILINGUAL_SALES, ...CHALLENGE_CALLS];
  for (const s of all) {
    const [present] = await db.select({ id: scenarios.id }).from(scenarios).where(eq(scenarios.slug, s.slug)).limit(1);
    if (present) continue;
    const [row] = await db.insert(scenarios).values({
      slug: s.slug,
      folio: s.folio,
      title: s.title,
      product: s.product,
      sector: s.sector,
      persona: s.persona,
      language: s.language ?? (s.languagePair ? s.languagePair : "fr"),
      languagePair: s.languagePair ?? null,
      difficulty: s.difficulty,
      modality: s.modality,
      summary: s.summary,
      brief: s.brief,
      coachingFocus: s.coachingFocus,
      competencies: JSON.stringify(s.competencies),
      rubric: rubricJson(),
      durationSeconds: s.duration ?? 0,
      factVersion: "v1.0",
      status: "published",
    });
    const id = (row as { insertId: number }).insertId;
    if (s.file) {
      await db.insert(mediaAssets).values({
        scenarioId: id,
        storageKey: `/manus-storage/${s.file}`,
        mimeType: "audio/mpeg",
        durationSeconds: s.duration ?? 0,
        language: s.language ?? "fr",
        description: `${s.language ?? "fr"} simulation recording — ${s.title}`,
      });
    }
  }
  console.log(`Academy catalogue checked: ${all.length} scenario definitions`);

  // Product facts
  const facts = await db.select({ id: productFacts.id }).from(productFacts).limit(1);
  if (facts.length === 0) {
    for (const f of FACTS) {
      await db.insert(productFacts).values({
        product: f.product,
        version: f.version,
        status: "approved",
        content: f.content,
        approvedAt: new Date(),
      });
    }
    console.log("Seeded approved product-fact baselines");
  }

  // Demo cohort (fictional)
  const demoUsers = [
    { openId: "demo-coach-leila", name: "Leïla Ben Salah", email: "leila.demo@codincloud.example", role: "coach" as const },
    { openId: "demo-learner-yassine", name: "Yassine Trabelsi", email: "yassine.demo@codincloud.example", role: "learner" as const },
    { openId: "demo-learner-mariem", name: "Mariem Gharbi", email: "mariem.demo@codincloud.example", role: "learner" as const },
  ];
  const ids: Record<string, number> = {};
  for (const u of demoUsers) {
    let [row] = await db.select().from(users).where(eq(users.openId, u.openId)).limit(1);
    if (!row) {
      const [ins] = await db.insert(users).values({ openId: u.openId, name: u.name, email: u.email, loginMethod: "demo", role: "user" });
      ids[u.openId] = (ins as { insertId: number }).insertId;
      row = { id: ids[u.openId] } as typeof row;
    } else {
      ids[u.openId] = row.id;
    }
    const [profile] = await db.select().from(academyProfiles).where(eq(academyProfiles.userId, ids[u.openId])).limit(1);
    if (!profile) {
      await db.insert(academyProfiles).values({
        userId: ids[u.openId],
        role: u.role,
        preferredLanguage: u.role === "coach" ? "fr" : "ar",
        secondLanguage: "fr",
      });
      await db.insert(consentRecords).values([
        { userId: ids[u.openId], purpose: "practice_records", status: "granted" },
        { userId: ids[u.openId], purpose: "ai_note_sharing", status: "revoked" },
      ]);
    }
  }

  const coachId = ids["demo-coach-leila"];
  const yassine = ids["demo-learner-yassine"];
  const mariem = ids["demo-learner-mariem"];

  const scenarioRows = await db.select().from(scenarios);
  const bySlug = Object.fromEntries(scenarioRows.map(s => [s.slug, s]));

  const demoAssignments = [
    { learnerId: yassine, slug: "fashion-boutique", status: "reviewed" as const },
    { learnerId: yassine, slug: "jacqueline-vendeur", status: "submitted" as const },
    { learnerId: mariem, slug: "electronics-warranty", status: "assigned" as const },
    { learnerId: mariem, slug: "vulnerable-customer", status: "submitted" as const },
  ];
  const createdAssignments: Record<string, number> = {};
  for (const a of demoAssignments) {
    const sc = bySlug[a.slug];
    if (!sc) continue;
    const [found] = await db.select().from(assignments).where(and(eq(assignments.learnerId, a.learnerId), eq(assignments.scenarioId, sc.id))).limit(1);
    if (found) { createdAssignments[a.slug] = found.id; continue; }
    const [ins] = await db.insert(assignments).values({
      learnerId: a.learnerId,
      scenarioId: sc.id,
      coachId,
      status: a.status,
      seedSource: "demo",
      consentState: "granted",
      dueAt: new Date(Date.now() + 7 * 86400000),
    });
    createdAssignments[a.slug] = (ins as { insertId: number }).insertId;
  }

  const attemptsExist = await db.select({ id: practiceAttempts.id }).from(practiceAttempts).limit(1);
  if (attemptsExist.length === 0) {
    const sc = bySlug["fashion-boutique"];
    if (sc && createdAssignments["fashion-boutique"]) {
      const [att] = await db.insert(practiceAttempts).values({
        learnerId: yassine,
        scenarioId: sc.id,
        assignmentId: createdAssignments["fashion-boutique"],
        mode: "structured",
        language: "fr",
        reflection: "I opened with permission and asked about her order volume before presenting anything. I said that delivery integrations must be confirmed and proposed a short validation call. I did not give a launch date.",
        transcript: "Sonia: Je vends surtout sur Instagram… Raoued: Si je comprends bien, votre priorité est de ne plus perdre de commandes…",
        status: "reviewed",
        durationSeconds: 540,
        completedAt: new Date(Date.now() - 2 * 86400000),
      });
      const attemptId = (att as { insertId: number }).insertId;
      const scores = [
        ["accuracy", 17], ["discovery", 13], ["relevance", 12], ["demo", 11],
        ["relationship", 9], ["closing", 8], ["security", 9], ["documentation", 4],
      ] as const;
      for (const [dim, score] of scores) {
        const r = RUBRIC.find(x => x.key === dim)!;
        await db.insert(rubricScores).values({
          attemptId, dimension: dim, score, maxScore: r.max, attribution: "human",
          feedback: dim === "accuracy" ? "You named the uncertainty on delivery integrations — good discipline." : undefined,
          reviewerId: coachId,
        });
      }
    }

    const sc2 = bySlug["jacqueline-vendeur"];
    if (sc2 && createdAssignments["jacqueline-vendeur"]) {
      await db.insert(practiceAttempts).values({
        learnerId: yassine,
        scenarioId: sc2.id,
        assignmentId: createdAssignments["jacqueline-vendeur"],
        mode: "roleplay",
        language: "fr",
        transcript: "Jacqueline: Vous affirmez une intégration KNX — où est la preuve ?\nRaoued: Vous avez raison de demander une preuve. Je ne peux pas confirmer cette intégration ici. Je la fais vérifier par notre équipe technique et je reviens vers vous vendredi avant 17h.",
        reflection: "I resisted the urge to claim compatibility. I need to work on asking about her architecture earlier.",
        status: "submitted",
        durationSeconds: 620,
        completedAt: new Date(Date.now() - 86400000),
      });
    }

    const sc3 = bySlug["vulnerable-customer"];
    if (sc3 && createdAssignments["vulnerable-customer"]) {
      await db.insert(practiceAttempts).values({
        learnerId: mariem,
        scenarioId: sc3.id,
        assignmentId: createdAssignments["vulnerable-customer"],
        mode: "structured",
        language: "fr",
        reflection: "I asked her to describe the charge without asking for her card number, reassured her, and escalated to the payments team with a reference. I committed to calling back tomorrow at 10h.",
        status: "submitted",
        durationSeconds: 480,
        completedAt: new Date(Date.now() - 3 * 86400000),
      });
    }
    console.log("Seeded demo assignments and attempts");
  }

  await db.insert(auditEvents).values({
    actorId: null,
    action: "seed.completed",
    entity: "academy",
    detail: "Idempotent seed of scenarios, facts and fictional demo cohort",
  });

  console.log("Seed complete");
}

const isCli = process.argv[1]?.endsWith("academySeed.ts");
if (isCli) {
  seedAcademy().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
