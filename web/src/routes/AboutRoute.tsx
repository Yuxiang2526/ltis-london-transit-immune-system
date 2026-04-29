import Reveal from "../components/ui/Reveal";
import SectionHeader from "../components/ui/SectionHeader";

/**
 * About + project information page.
 *
 * Reflects the dual-track architecture of the deliverable:
 *   - LTIS narrative track (Story + Explorer + Methodology) — Yuxiang Fan
 *   - LTRS network track (Network Map iframe) — Siyan Tao
 * with a shared methodology page that documents both.
 *
 * Required by the rubric (80%+):
 *   - Contributions table
 *   - AI tool usage statement
 *   - Open data + library references
 */

const PARTS = [
  {
    number: "01",
    title: "Story",
    summary:
      "An editorial scrollytelling sequence that introduces baseline accessibility (PTAL), the disruption hypothesis, and the resulting fallback-mobility pattern at LSOA scale.",
    accent: "cool" as const,
  },
  {
    number: "02",
    title: "Explorer",
    summary:
      "An interactive scenario explorer for switching disruption line and metric, ranking neighbourhoods, and inspecting a five-dimension fallback profile per LSOA.",
    accent: "accent" as const,
  },
  {
    number: "03",
    title: "Network Map",
    summary:
      "The LTRS companion tool: 100 m grid resilience under multi-route disruption, computed via OSM road-network Dijkstra walking. Cancel routes and see per-cell impact.",
    accent: "warm" as const,
  },
  {
    number: "04",
    title: "Methodology",
    summary:
      "Dual-method documentation covering both the LSOA-scale LTIS composite and the 100 m-grid LTRS Dijkstra model, with limitations and references.",
    accent: "warm" as const,
  },
];

const TEAM = [
  {
    name: "Yuxiang Fan",
    initials: "YF",
    role: "LTIS narrative + Explorer; design system; scrollytelling; deployment",
  },
  {
    name: "Siyan Tao",
    initials: "ST",
    role: "LTRS Network Map; OSM Dijkstra walking model; 100 m grid resilience pipeline",
  },
];

const CONTRIBUTIONS = [
  { task: "Concept development", major: "Yuxiang Fan, Siyan Tao", ai: "No AI use" },
  {
    task: "Data preparation (PTAL 2023 LSOA aggregation, NaPTAN, OSM walking network)",
    major: "Siyan Tao",
    ai: "No AI use",
  },
  {
    task: "OSM Dijkstra walking-time pipeline (4,994 LSOAs × 27,553 stops)",
    major: "Siyan Tao",
    ai: "No AI use",
  },
  {
    task: "100 m grid resilience model + 543-route impact pre-computation",
    major: "Siyan Tao",
    ai: "ChatGPT used to debug edge cases in the route-grid loss aggregation",
  },
  {
    task: "Network Map UI (Mapbox GL JS, compare mode, cancel-routes interaction)",
    major: "Siyan Tao",
    ai: "ChatGPT used for Mapbox style expression syntax queries",
  },
  {
    task: "LTIS LSOA-level pipeline (Python, Shapely, scenario indicators)",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to scaffold the conversion script",
  },
  {
    task: "LTIS website (React + TypeScript + Vite + MapLibre GL)",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used for component scaffolding and MapLibre layer wiring",
  },
  {
    task: "Editorial design system (light theme, RdBu palette, typography)",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to draft CSS tokens",
  },
  {
    task: "Scrollytelling narrative (scrollama + frame data)",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to draft component structure",
  },
  {
    task: "Methodology summary writing + reference list curation",
    major: "Yuxiang Fan, Siyan Tao",
    ai: "ChatGPT used for copy-editing the methodology prose",
  },
  {
    task: "Iframe integration of Network Map into LTIS site",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to plan and execute the integration",
  },
  {
    task: "GitHub deployment + GitHub Release for large data assets",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to write the deploy.yml workflow",
  },
];

const SOURCES = [
  {
    part: "Baseline",
    name: "PTAL 2023 — LSOA aggregated",
    description:
      "TfL's Public Transport Accessibility Level grid aggregated to 2021 LSOAs (mean accessibility index + dominant PTAL band). Provides the LTIS baseline.",
  },
  {
    part: "Baseline",
    name: "PTAL 2023 — 100 m grid",
    description:
      "TfL PTAL 2023 raw 100 m grid cells (~159k cells across Greater London). Provides the LTRS baseline AI score.",
  },
  {
    part: "Geometry",
    name: "ONS LSOA 2021 boundaries",
    description:
      "4,994 Lower Super Output Areas across Greater London. Spatial unit for the LTIS narrative layer.",
  },
  {
    part: "Network",
    name: "NaPTAN (Department for Transport)",
    description:
      "27,553 transit stops across London (bus, tube, DLR, Overground, Elizabeth, Tramlink) with route membership. Drives both layers.",
  },
  {
    part: "Network",
    name: "Underground Stations + 540+ Bus / Rail routes (TfL)",
    description:
      "Line and route geometry. The LTIS layer uses 3 Underground scenarios; the LTRS layer covers 543 individual routes.",
  },
  {
    part: "Network",
    name: "OpenStreetMap walking network",
    description:
      "OSM road / footpath graph for Greater London. Used in the LTRS pipeline for Dijkstra shortest-path walking-time computation (4.8 km/h, 2,400 m cap).",
  },
  {
    part: "Population",
    name: "ONS LSOA mid-year population",
    description:
      "Resident population per LSOA. Used to compute the LTIS exposure indicator (loss × population).",
  },
  {
    part: "Context",
    name: "OpenStreetMap basemap (CARTO Positron + Mapbox Streets)",
    description:
      "Light raster basemap. © OpenStreetMap contributors © CARTO (LTIS) and Mapbox (LTRS).",
  },
];

const TECH = [
  "React 19",
  "TypeScript",
  "Vite",
  "MapLibre GL",
  "Mapbox GL JS",
  "d3-geo",
  "d3-shape",
  "scrollama",
  "KaTeX",
  "Python · Shapely",
  "Python · NetworkX (Dijkstra)",
  "GitHub Actions",
  "GitHub Pages + Releases",
];

const AI_USAGE = [
  {
    tool: "Anthropic Claude (via Claude Code)",
    purpose:
      "Code scaffolding, MapLibre layer wiring, React component structure, ADR drafting, PTAL→LTIS conversion script, iframe integration of the Network Map. Every artefact was inspected and edited by a named author before being committed.",
  },
  {
    tool: "OpenAI ChatGPT",
    purpose:
      "Mapbox style expression queries during Network Map development; copy-editing of methodology prose; licence-term disambiguation. No analytical findings, methodological choices, citations or final wording were generated by an AI tool without author review.",
  },
];

export default function AboutRoute() {
  return (
    <article className="about-page">
      {/* Hero */}
      <Reveal>
        <header className="about-hero">
          <p className="eyebrow">About this project</p>
          <h1>London Transit Immune System</h1>
          <p className="about-hero__lede">
            <em>LTIS</em> is a group data-visualisation project investigating
            how unevenly transport resilience is distributed across London
            neighbourhoods. It ships two complementary analytical layers — an
            LSOA-scale LTIS narrative and a 100 m-grid LTRS network explorer —
            that read together as a single argument about spatial inequality.
            Produced as part of the CASA0029 module at the Centre for Advanced
            Spatial Analysis, University College London, 2025/26 (Group 17).
          </p>
        </header>
      </Reveal>

      {/* 4-part overview */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Site structure"
          title="Four connected views, two analytical layers"
          description="The site moves from narrative to two interactive tools to method, with each part building on the previous one."
        />
        <div className="about-parts-grid">
          {PARTS.map((p, i) => (
            <Reveal key={p.number} delay={i * 0.08}>
              <article className={`about-part-card about-part-card--${p.accent}`}>
                <p className="about-part-number">{p.number}</p>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Contributors"
          title="Team"
          description="A two-person group with clearly separated technical responsibilities."
        />
        <div className="about-team-grid">
          {TEAM.map((m) => (
            <div key={m.name} className="about-team-card">
              <div className="about-team-avatar">{m.initials}</div>
              <div>
                <p className="about-team-card__name">{m.name}</p>
                <p className="about-team-card__role">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contributions table */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Contributions table"
          title="Task-by-task ownership"
          description="Per CASA0029 marking guidance, each project task is attributed to its major contributor and any AI-tool involvement is itemised."
        />
        <div className="about-sources">
          <div className="about-sources-row about-sources-row--head">
            <span>Task</span>
            <span>Major contributors</span>
            <span>AI tool usage in this task</span>
          </div>
          {CONTRIBUTIONS.map((c) => (
            <div className="about-sources-row" key={c.task}>
              <strong>{c.task}</strong>
              <span>{c.major}</span>
              <span>{c.ai}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI usage detail */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Transparency"
          title="AI tool usage"
          description="Every AI-assisted artefact was reviewed and edited by a named author before being committed to the repository."
        />
        <div className="about-sources">
          <div className="about-sources-row about-sources-row--head">
            <span>Tool</span>
            <span>Purpose</span>
            <span>Review</span>
          </div>
          {AI_USAGE.map((u) => (
            <div className="about-sources-row" key={u.tool}>
              <strong>{u.tool}</strong>
              <span>{u.purpose}</span>
              <span>Author-reviewed before commit</span>
            </div>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Data"
          title="Data sources"
          description="All datasets used in this project are publicly available under permissive licences."
        />
        <div className="about-sources">
          <div className="about-sources-row about-sources-row--head">
            <span>Layer</span>
            <span>Dataset</span>
            <span>Used for</span>
          </div>
          {SOURCES.map((s) => (
            <div className="about-sources-row" key={s.name}>
              <span>{s.part}</span>
              <strong>{s.name}</strong>
              <span>{s.description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Stack"
          title="Tools &amp; technologies"
          description="The site is fully open-source. The LTIS layer uses open MapLibre GL; the LTRS layer uses Mapbox GL JS with a token restricted to the deployed domain."
        />
        <div className="about-tag-strip">
          {TECH.map((t) => (
            <span key={t} className="about-tag">
              {t}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}
