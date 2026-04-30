import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Math from "../components/ui/Math";

/**
 * Methodology page — verbatim alignment with the project's authoritative
 * Introduction document (HTML Siyan Tao / Introduction.docx, Apr 2026).
 * Every formula, catchment radius and reference here is sourced from that
 * document; the LSOA aggregation paragraph reflects how the same grid-level
 * AI is rolled up for the Story / Explorer narrative views.
 *
 * Layout: sticky left-side TOC nav with scroll-spy active state, plus the
 * long-form prose with KaTeX formulas.
 */

const SECTIONS: { id: string; label: string }[] = [
  { id: "introduction",  label: "1. Introduction" },
  { id: "data",          label: "2. Data" },
  { id: "methodology",   label: "3. Methodology" },
  { id: "discussion",    label: "4. Discussion & limitations" },
  { id: "references",    label: "5. References" },
];

function useScrollSpy(ids: string[], offset = 120): string {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - offset;
        if (top <= 0) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, offset]);
  return active;
}

export default function MethodologyRoute() {
  const active = useScrollSpy(SECTIONS.map((s) => s.id));

  return (
    <div className="methodology-shell">
      <aside className="methodology-toc" aria-label="Methodology contents">
        <h4>Contents</h4>
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={active === s.id ? "is-active" : ""}>
            {s.label}
          </a>
        ))}
      </aside>

      <article className="methodology-panel" id="methodology-root">
        <div className="section-heading">
          <p className="eyebrow">Methodology</p>
          <h2>London Transit Resilience System (LTRS)</h2>
          <p className="muted">
            CASA0029 · Group 17 · Centre for Advanced Spatial Analysis, UCL ·
            April 2026 · 955 words.
          </p>
        </div>

        <div className="prose">
          {/* ── 1. Introduction ──────────────────────────────────────────── */}
          <h2 id="introduction">1. Introduction</h2>
          <p>
            In complex urban systems, the stability of public transport
            networks affects not only daily commuting efficiency, but also
            residents&rsquo; access to jobs, education, healthcare, and public
            services. Previous studies have shown that transport resilience is
            an important foundation for the functioning of urban society
            (Chopra et al., 2016). At the same time, transport equity research
            has gradually moved beyond simple measures of transport supply or
            passenger capacity. It now pays more attention to whether
            different areas and social groups can access travel opportunities
            fairly (Li et al., 2025). Recent studies have also compared
            accessibility differences across education groups, transport
            modes, and job opportunities, showing that urban transport systems
            can produce both spatial and social inequalities (Liu and Yu,
            2025).
          </p>
          <p>
            However, most existing studies focus on accessibility under normal
            operating conditions. Less attention has been paid to whether
            different areas can maintain their original accessibility when the
            transport network is disrupted. For cities with complex public
            transport systems, high accessibility in normal conditions does
            not necessarily mean strong transport resilience. If an area
            depends heavily on a small number of key routes or stations, its
            accessibility may drop quickly when these links are disrupted.
            Therefore, transport equity should not only ask <em>who has better
            accessibility in normal conditions</em>. It should also ask{" "}
            <em>who is more likely to lose accessibility after a disruption</em>.
            Based on this research gap, this project extends the focus from
            static accessibility distribution to accessibility retention under
            route disruption scenarios. In this project, this retention
            capacity is defined as <strong>transport resilience</strong>.
          </p>

          {/* ── 2. Data ──────────────────────────────────────────────────── */}
          <h2 id="data">2. Data</h2>
          <p>
            This project uses multi-source open datasets to assess
            London&rsquo;s public transport resilience at two spatial scales:{" "}
            <strong>100 m grids</strong> and <strong>LSOAs</strong>.
          </p>
          <ol>
            <li>
              <strong>2023 PTAL dataset</strong> — informs the baseline
              accessibility layer and measures the quality of public transport
              connectivity in London.
            </li>
            <li>
              <strong>Public transport access points</strong> — derived from
              Great Britain&rsquo;s national dataset (NaPTAN); London transport
              station and route data are used to represent local services.
              Night buses and temporary bus routes are excluded to mitigate the
              impact of irregular bus services on travel resilience. The
              GLA&rsquo;s Statistical GIS Boundary Files are used as a spatial
              mask to retain only the transit data falling within the London
              administrative area.
            </li>
            <li>
              <strong>London network topology data</strong> — supports the
              modelling of route disruption scenarios and accessibility change.
            </li>
          </ol>

          {/* ── 3. Methodology ───────────────────────────────────────────── */}
          <h2 id="methodology">3. Methodology</h2>
          <p>
            The core contribution of this model lies in the development of an
            interactive platform supporting <em>scenario analysis</em>.
            Diverging from the static PTAL data provided by TfL&rsquo;s
            official WebCAT, this model implements{" "}
            <strong>real-time re-computation within the web browser</strong>.
            The specific operational procedure has three steps.
          </p>

          <h3>3.1 Baseline map</h3>
          <p>
            The baseline map is built on the <strong>2023 PTAL values</strong>.
            It visualises the current inequality in public transport
            connectivity shown by the official PTAL data. The{" "}
            <Link to="/">Story</Link> page and the{" "}
            <Link to="/explore">Explorer</Link> use this layer aggregated to
            LSOA scale; the <Link to="/network">Network Map</Link> preserves
            it at native 100 m resolution.
          </p>

          <h3>3.2 Per-grid Accessibility Index</h3>
          <p>
            Following TfL&rsquo;s PTAL calculation logic, the map estimates
            accessibility for each <strong>100 m × 100 m grid</strong> using
            the real OSM walking network and open public transport stop data.
            For each grid centroid, reachable stops are identified within PTAL
            walking catchments: <strong>640 m</strong> for bus stops and{" "}
            <strong>960 m</strong> for rail-based stops. These catchments are
            measured along the OSM walking network with a walking speed of
            4.8 km/h. The Accessibility Index is then calculated by summing the
            contributions of all reachable routes:
          </p>
          <Math display>
            {String.raw`\text{AI}_i = \sum_{s \in S_i} \sum_{r \in R_s} C_{i s r}`}
          </Math>
          <p>
            where <Math>{String.raw`S_i`}</Math> is the set of reachable stops
            from grid <Math>i</Math>, <Math>{String.raw`R_s`}</Math> is the set
            of routes serving stop <Math>s</Math>, and{" "}
            <Math>{String.raw`C_{i s r}`}</Math> is the accessibility
            contribution of route <Math>r</Math> at stop <Math>s</Math>. In
            this project, the route contribution is calculated using a{" "}
            <strong>distance-decay function</strong>:
          </p>
          <Math display>
            {String.raw`C_{i s r} = w_{i s r} \cdot \max\!\left(0,\; 1 - \frac{d_{i s}}{D_m}\right) \cdot 10`}
          </Math>
          <p>
            where <Math>{String.raw`w_{i s r}`}</Math> is the route weight,{" "}
            <Math>{String.raw`d_{i s}`}</Math> is the OSM-network walking
            distance from grid <Math>i</Math> to stop <Math>s</Math>, and{" "}
            <Math>{String.raw`D_m`}</Math> is the mode-specific catchment
            distance (640 m for bus, 960 m for rail). A closer stop gives a
            higher contribution; a stop outside the catchment gives a zero
            contribution.
          </p>
          <p>
            Next, average reachability is calculated using LSOA-based
            polygonal spatial aggregation for macro-level analysis. Every
            value visible in the Story and Explorer choropleth is the mean of
            the grid-level <Math>{String.raw`\text{AI}_i`}</Math> across all
            grid cells whose centroid falls inside the LSOA polygon.
          </p>

          <h3>3.3 Disruption scenarios &amp; the LTRS score</h3>
          <p>
            When the user cancels selected routes in the Network Map, the map
            recalculates grid-level accessibility by removing the AI
            contributions of those routes. The accessibility loss is measured
            as:
          </p>
          <Math display>
            {String.raw`\text{AI}_{\text{loss},\,i} = \text{AI}_{\text{baseline},\,i} - \text{AI}_{\text{disrupted},\,i}`}
          </Math>
          <p>
            and the <strong>Local Transit Resilience Score</strong> is
            calculated as:
          </p>
          <Math display>
            {String.raw`\text{LTRS}_i = \frac{\text{AI}_{\text{disrupted},\,i}}{\text{AI}_{\text{baseline},\,i}}`}
          </Math>
          <p>
            A larger accessibility drop indicates weaker resilience. Therefore,
            the lower the <Math>{String.raw`\text{LTRS}_i`}</Math> value, the
            more vulnerable the grid is under the selected route disruption
            scenario. The Network Map&rsquo;s split-screen renders baseline AI
            on the left and the AI-loss percentage{" "}
            <Math>{String.raw`(1 - \text{LTRS}_i)`}</Math> on the right, with
            a six-step white→burgundy ramp matching the project&rsquo;s
            diverging palette.
          </p>
          <p>
            The per-route, per-grid loss matrix{" "}
            <Math>{String.raw`\Delta\text{AI}(i, r)`}</Math> is{" "}
            <strong>pre-computed once</strong> across all 543 routes
            (<code>route_grid_impacts_osm_network.json</code>, ~13 MB). At
            interaction time the tool just sums losses — that is how
            cancelling several routes simultaneously updates 159,000 cells in
            a few hundred milliseconds.
          </p>

          <aside className="method-source-callout">
            <p className="eyebrow">Reproducibility</p>
            <h4>Source code &amp; pre-computation pipeline</h4>
            <p>
              The full data-calculation pipeline — OSM walking-network
              extraction, per-grid AI computation, the 543-route per-cell
              loss matrix, and all input metadata — is open on GitHub. Every
              number rendered on this site can be regenerated from these
              scripts and the public source data.
            </p>
            <a
              href="https://github.com/Taoo2025/CASA0029/tree/main/data_calculating"
              target="_blank"
              rel="noreferrer"
              className="method-source-callout__cta"
            >
              <span>Open <code>Taoo2025/CASA0029 · /data_calculating</code> on GitHub</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M14 3h7v7M21 3l-9 9M19 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </aside>

          {/* ── 4. Discussion / Limitations ─────────────────────────────── */}
          <h2 id="discussion">4. Discussion &amp; limitations</h2>
          <p>
            Despite its effectiveness, this study has several limitations due
            to computational constraints. First, our model does not fully
            replicate the official TfL PTAL methodology. Specifically, we did
            not include <strong>frequency attenuation</strong> or{" "}
            <strong>multi-modal transfers</strong>, such as moving from a bus
            to the Underground. Furthermore, our analysis assumes a static
            environment and does not account for service changes during
            weekends or peak hours.
          </p>
          <p>
            Future research could improve these calculation methods to provide
            a more realistic simulation. It is also important to integrate
            more socio-demographic factors, such as the{" "}
            <strong>Index of Multiple Deprivation (IMD)</strong>. By
            performing an IMD overlay analysis, researchers can better
            identify which vulnerable groups are most affected by transport
            disruptions. This would help planners understand how transport
            resilience contributes to wider social inequality in London.
          </p>

          {/* ── 5. References ───────────────────────────────────────────── */}
          <h2 id="references">5. References</h2>
          <ol className="references">
            <li>
              Chopra, S. S. et al. (2016). A network-based framework for
              assessing infrastructure resilience: a case study of the London
              metro system. <em>Journal of The Royal Society Interface</em>,{" "}
              13(118), p. 20160113.
            </li>
            <li>
              Li, A. et al. (2025). Ease and Equity of Point of Interest
              Accessibility via Public Transit in the U.S. <em>arXiv</em>.
            </li>
            <li>
              Liu, Z. and Yu, Z. (2025). Transport equity assessment based on
              accessibility disparities in terms of multi-job opportunities
              across Beijing. <em>Scientific Reports</em>, 15(1), p. 30878.
            </li>
          </ol>

          <p>
            <Link to="/about">See the About page</Link> for the AI-tool usage
            statement and contributor credits.
          </p>
        </div>
      </article>
    </div>
  );
}
