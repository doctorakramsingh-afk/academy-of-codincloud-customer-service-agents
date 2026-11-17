import { AcademyShell } from "@/components/academy/AcademyShell";
import { DifficultyBadge, EmptyState, Folio, LanguageChip, SectionHeading } from "@/components/academy/ui";
import { formatDuration } from "@/lib/academy";
import { trpc } from "@/lib/trpc";
import { Headphones, Search, TextQuote } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Library() {
  const [q, setQ] = useState("");
  const [product, setProduct] = useState("all");
  const [language, setLanguage] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [modality, setModality] = useState("all");

  const facets = trpc.academy.scenarios.facets.useQuery();
  const list = trpc.academy.scenarios.list.useQuery({ q: q || undefined, product, language, difficulty, modality });

  const rows = list.data ?? [];

  return (
    <AcademyShell>
      <div className="animate-rise">
        <SectionHeading eyebrow="Scenario library" title="Five hundred and twenty-six folios, one standard.">
          Listen to the recording, read the brief, then practise. Every folio carries its spoken language, difficulty and the competencies it exercises. Every folio carries its real practice language; choose French, English, German, Spanish, Italian, Japanese, Chinese, Portuguese or Arabic.
        </SectionHeading>

        <div className="paper-card mb-6 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkmuted" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search title, sector, product or persona…"
                className="w-full rounded-sm border border-line bg-paper py-2 pl-9 pr-3 text-[13px] outline-none placeholder:text-inkmuted/70 focus:border-teal"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <select value={product} onChange={e => setProduct(e.target.value)} className="rounded-sm border border-line bg-paper px-2.5 py-2 text-[12px]" aria-label="Filter by product">
                <option value="all">All products</option>
                {(facets.data?.products ?? []).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="rounded-sm border border-line bg-paper px-2.5 py-2 text-[12px]" aria-label="Filter by language">
                <option value="all">All languages</option>
                {(facets.data?.languages ?? []).map(l => <option key={l} value={l}>{l === "ar-fr" ? "Arabic–French" : l.toUpperCase()}</option>)}
              </select>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="rounded-sm border border-line bg-paper px-2.5 py-2 text-[12px]" aria-label="Filter by difficulty">
                <option value="all">All levels</option>
                {(facets.data?.difficulties ?? []).map(d => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
              </select>
              <select value={modality} onChange={e => setModality(e.target.value)} className="rounded-sm border border-line bg-paper px-2.5 py-2 text-[12px]" aria-label="Filter by format">
                <option value="all">All formats</option>
                <option value="audio">Audio</option>
                <option value="text">Text-only</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-[11px] uppercase tracking-[0.12em] text-inkmuted">{rows.length} folio{rows.length === 1 ? "" : "s"}</span>
            <span className="text-[11px] text-inkmuted">{rows.filter(r => r.hasAudio).length} with audio · {rows.filter(r => !r.hasAudio).length} text-only</span>
          </div>
        </div>

        {list.isLoading ? (
          <div className="py-16 text-center text-sm text-inkmuted">Loading folios…</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No folio matches these filters">Try a different product, language or difficulty. The full catalogue has 1026 scenarios, including the 500-simulation English challenge plus 500 French simulations.</EmptyState>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {rows.map(s => (
              <Link key={s.id} href={`/scenarios/${s.slug}`} className="group grid grid-cols-[52px_1fr] gap-4 py-5 transition-colors hover:bg-paper-2/40 md:grid-cols-[64px_1.6fr_1fr] md:items-start">
                <Folio n={s.folio} />
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <LanguageChip language={s.language} />
                    <DifficultyBadge difficulty={s.difficulty} />
                    <span className="stamp border-transparent bg-transparent px-1 text-inkmuted">
                      {s.hasAudio ? <Headphones className="h-3 w-3" /> : <TextQuote className="h-3 w-3" />}
                      {s.hasAudio ? formatDuration(s.durationSeconds) : "Text"}
                    </span>
                  </div>
                  <h3 className="text-[19px] leading-snug group-hover:text-teal-dark">{s.title}</h3>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-[12.5px] leading-relaxed text-inkmuted">{s.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.competencies.slice(0, 3).map(c => <span key={c} className="rounded-sm bg-paper-2 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-inkmuted">{c}</span>)}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="eyebrow mb-1.5">{s.product}</div>
                  <div className="text-[12px] leading-relaxed text-inkmuted">{s.sector}</div>
                  <div className="mt-2 text-[11px] leading-relaxed text-inkmuted/80">{s.persona}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AcademyShell>
  );
}
