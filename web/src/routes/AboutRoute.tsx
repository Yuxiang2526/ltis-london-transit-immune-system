import Reveal from "../components/ui/Reveal";
import SectionHeader from "../components/ui/SectionHeader";

/**
 * About + project information page (rubric-required).
 *
 * Honest split per project decision (D2 2026-04-30):
 *   - Data analysis & modelling = Siyan Tao
 *   - Web wrapper & visualisation packaging = Yuxiang Fan
 *
 * The site is one project with two contributors playing distinct roles, not a
 * "dual-team / dual-track" — that previous framing was a polite fiction.
 */

const PARTS = [
  {
    number: "01",
    title: "Story",
    summary:
      "Editorial scrollytelling that walks through the LTRS findings using three reference routes (99, R2, 685). Backed by the same OSM-Dijkstra grid data, aggregated to LSOA scale.",
    accent: "cool" as const,
  },
  {
    number: "02",
    title: "Explorer",
    summary:
      "LSOA narrative overview — baseline accessibility choropleth, click-to-inspect local profile, Lorenz curve of city-wide concentration. Hands the user off to the Network Map for forensic detail.",
    accent: "accent" as const,
  },
  {
    number: "03",
    title: "Network Map",
    summary:
      "The analytical core: cancel any combination of 543 routes, navigate by postcode or borough, inspect resilience at 100 m grid resolution. Built on OSM walking-network Dijkstra.",
    accent: "warm" as const,
  },
  {
    number: "04",
    title: "Methodology",
    summary:
      "End-to-end documentation of the LTRS pipeline: data sources, AI recomputation on the OSM walking network, scenario formulation, LSOA aggregation, limitations, references.",
    accent: "warm" as const,
  },
];

const TEAM = [
  {
    name: "Siyan Tao",
    initials: "ST",
    role: "Data analysis &amp; modelling — OSM Dijkstra walking-network pipeline; 543-route impact pre-computation; 100 m grid LTRS engine; Network Map UI (Mapbox GL JS).",
  },
  {
    name: "Yuxiang Fan",
    initials: "YF",
    role: "Web wrapper &amp; visualisation packaging — React + TypeScript + Vite skeleton; design system; scrollytelling; LSOA aggregation views; methodology + about pages; deployment.",
  },
];

const CONTRIBUTIONS = [
  { task: "Concept development", major: "Yuxiang Fan, Siyan Tao", ai: "No AI use" },
  {
    task: "PTAL 2023 acquisition + LSOA / NaPTAN preparation",
    major: "Siyan Tao",
    ai: "No AI use",
  },
  {
    task: "OSM walking network extraction + Dijkstra pipeline (4,994 LSOAs × 27,553 stops)",
    major: "Siyan Tao",
    ai: "No AI use",
  },
  {
    task: "100 m grid AI baseline + per-route impact pre-computation (543 routes)",
    major: "Siyan Tao",
    ai: "ChatGPT used to debug edge cases in the loss aggregation",
  },
  {
    task: "Network Map UI (Mapbox GL, compare mode, route cancel + LSOA / borough panels)",
    major: "Siyan Tao",
    ai: "ChatGPT used for Mapbox style expression syntax queries",
  },
  {
    task: "LSOA aggregation pipeline (build_ltis_from_lsoa_summary.py)",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to scaffold the script and Shapely fallback for MultiPolygon edge cases",
  },
  {
    task: "React skeleton: routing, layout, design tokens, typography",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used for component scaffolding",
  },
  {
    task: "MapLibre LTIS choropleth + colour ramps + legend",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used for MapLibre layer wiring",
  },
  {
    task: "Scrollytelling narrative (scrollama + frame data)",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to draft component structure; frame copy refined against real data",
  },
  {
    task: "Iframe embed of Network Map into the React site",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to plan and execute the integration",
  },
  {
    task: "Methodology + About + reference list",
    major: "Yuxiang Fan, Siyan Tao",
    ai: "ChatGPT used for copy-editing the methodology prose; final wording author-reviewed",
  },
  {
    task: "GitHub deployment workflow + Pages configuration",
    major: "Yuxiang Fan",
    ai: "Anthropic Claude (via Claude Code) used to write the deploy.yml workflow",
  },
];

const SOURCES = [
  {
    part: "Network",
    name: "NaPTAN (Department for Transport)",
    description:
      "27,553 transit stops across Greater London. Bus, Tube, DLR, Overground, Elizabeth, Tramlink. Each stop carries route-membership metadata. Driver of the entire LTRS engine.",
  },
  {
    part: "Network",
    name: "OSM walking network",
    description:
      "OpenStreetMap road and footpath graph for Greater London. Used by the Dijkstra walker (4.8 km/h, 2,400 m budget) to compute realistic walking time from any 100 m grid centroid to each NaPTAN stop.",
  },
  {
    part: "Baseline",
    name: "PTAL 2023 — 100 m grid (TfL WebCAT)",
    description:
      "159,451 grid cells covering Greater London. Used as a sanity-check reference for the recomputed AI scores.",
  },
  {
    part: "Routes",
    name: "TfL line and route geometry",
    description:
      "Tube, Overground, Elizabeth, DLR, Tramlink + 540+ bus routes (route_lines.geojson). Drives both the visual route layer and the route-cancel logic.",
  },
  {
    part: "Geometry",
    name: "ONS LSOA 2021 boundaries",
    description:
      "4,994 Lower Super Output Areas across Greater London. Spatial unit for the LSOA-scale narrative views (Story + Explorer).",
  },
  {
    part: "Context",
    name: "OpenStreetMap basemaps (CARTO Positron + Mapbox Streets)",
    description:
      "Light raster basemap for the LSOA Explorer (CARTO) and editorial basemap for the Network Map (Mapbox).",
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
  "Python · OSMnx / NetworkX (Dijkstra)",
  "GitHub Actions",
  "GitHub Pages",
];

const AI_USAGE = [
  {
    tool: "Anthropic Claude (via Claude Code)",
    purpose:
      "Code scaffolding, MapLibre layer wiring, React component structure, design-token CSS drafting, scrollytelling component shape, LSOA aggregation script, deploy.yml workflow, iframe integration of the Network Map. Every artefact was inspected and edited by the author before being committed.",
  },
  {
    tool: "OpenAI ChatGPT",
    purpose:
      "Mapbox style-expression syntax during Network Map development; copy-editing of methodology prose; licence-term disambiguation. No analytical findings, methodological choices, citations or final wording were generated by an AI tool without author review.",
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
            <em>LTIS</em> is a CASA0029 Group Project (Group 17, 2025/26). Its
            analytical core is an OSM walking-network Dijkstra model that
            covers 159,451 grid cells, 27,553 transit stops, and 543 transport
            routes across Greater London. The Story page tells the narrative;
            the Explorer is the LSOA-scale overview; the Network Map is the
            forensic tool. They share one engine.
          </p>
        </header>
      </Reveal>

      {/* 4 parts */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Site structure"
          title="Four pages, one analytical engine"
          description="The site moves from narrative to LSOA overview to 100 m forensic tool to method. Each part reads what the previous one shows."
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

      {/* Team — honest split */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Contributors"
          title="Team"
          description="Two contributors, two distinct roles."
        />
        <div className="about-team-grid">
          {TEAM.map((m) => (
            <div key={m.name} className="about-team-card">
              <div className="about-team-avatar">{m.initials}</div>
              <div>
                <p className="about-team-card__name">{m.name}</p>
                <p
                  className="about-team-card__role"
                  dangerouslySetInnerHTML={{ __html: m.role }}
                />
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

      {/* AI usage */}
      <section className="about-section">
        <SectionHeader
          eyebrow="Transparency"
          title="AI tool usage"
          description="Every AI-assisted artefact was reviewed and edited by the responsible author before being committed."
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
          description="The site is fully open-source. The Explorer uses open MapLibre GL; the Network Map uses Mapbox GL JS with a token restricted to the deployed origin."
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
