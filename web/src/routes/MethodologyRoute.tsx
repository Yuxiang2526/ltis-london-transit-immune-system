import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Math from "../components/ui/Math";

/**
 * Methodology page (rubric requirement: ~1000 word methodology summary,
 * accessible to a general audience, academically rigorous, with clear
 * referencing).
 *
 * The project's analytical core is the LTRS / OSM-Dijkstra walking-network
 * pipeline by Siyan Tao. The LSOA narrative views (Story + Explorer) are
 * aggregated outputs of the same engine, NOT a separate model.
 *
 * Layout: sticky left-side TOC nav (rail-nature reference pattern) with
 * scroll-spy active state, plus the long-form prose with KaTeX formulas.
 */

const SECTIONS: { id: string; label: string }[] = [
  { id: "research-question", label: "1. Research question" },
  { id: "framework",         label: "2. Conceptual framework" },
  { id: "data",              label: "3. Data sources" },
  { id: "ai-baseline",       label: "4. Baseline AI" },
  { id: "ltrs",              label: "5. The LTRS score" },
  { id: "scenarios",         label: "6. The three reference routes" },
  { id: "lsoa-aggregation",  label: "7. LSOA aggregation" },
  { id: "distribution",      label: "8. Distribution & Gini" },
  { id: "limitations",       label: "9. Limitations" },
  { id: "references",        label: "10. References" },
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

      <article className="methodology-panel" id="methodology">
        <div className="section-heading">
          <p className="eyebrow">Methodology</p>
          <h2>How LTRS &amp; the LSOA narrative views are constructed</h2>
          <p className="muted">
            One analytical engine, two presentation layers. The full
            reproducibility manifest is at <code>docs/methodology.md</code>;
            the design decisions log is at <code>docs/decisions/</code>.
          </p>
        </div>

        <div className="prose">
          {/* ── 1. Research question ─────────────────────────────────────── */}
          <h2 id="research-question">1. Research question</h2>
          <p>
            How unevenly is transport resilience distributed across London, and
            how do single-route disruptions expose differences in local
            transport substitutability?
          </p>

          {/* ── 2. Framework ─────────────────────────────────────────────── */}
          <h2 id="framework">2. Conceptual framework</h2>
          <p>
            We adopt a <em>single-step, impact-based</em> definition of
            resilience: the share of baseline accessibility a place retains
            when a specific corridor fails (Jenelius, 2010; D'Lima &amp; Medda,
            2016). This narrows the broader resilience literature, which spans
            temporal recovery (Bruneau et al., 2003; Henry &amp; Ramirez-Marquez,
            2012) and topological robustness (Derrible &amp; Kennedy, 2010;
            Cats, 2016), to a measure that is computable from open static data
            and decomposes naturally to neighbourhoods. The technical claim
            is spatial vulnerability under disruption — the project name
            reflects the same framing in editorial form.
          </p>

          {/* ── 3. Data sources ──────────────────────────────────────────── */}
          <h2 id="data">3. Data sources</h2>
          <ul>
            <li>
              <strong>NaPTAN</strong> (DfT, OGL v3) — 27,553 transit stops
              across Greater London, with ATCO codes, mode tags and
              line/route membership.
            </li>
            <li>
              <strong>OpenStreetMap walking network</strong> (ODbL) — extracted
              for Greater London. Used as the routable graph for shortest-path
              walking time from any 100 m grid cell centroid to nearby stops.
            </li>
            <li>
              <strong>PTAL 2023 100 m grid</strong> (TfL WebCAT) — 159,451
              cells covering Greater London. Provides the official PTAL band
              attribute used as a sanity check against our recomputed AI.
            </li>
            <li>
              <strong>TfL line and route geometry</strong> — Tube, Overground,
              Elizabeth, DLR, Tramlink and 540+ bus routes (route_lines.geojson).
            </li>
            <li>
              <strong>ONS LSOA 2021 boundaries</strong> — 4,994 polygons.
              Spatial unit for the narrative views.
            </li>
          </ul>

          {/* ── 4. Baseline AI ──────────────────────────────────────────── */}
          <h2 id="ai-baseline">4. Recomputing baseline AI on the OSM walking network</h2>
          <p>
            For each 100 m grid cell <Math>g</Math>, we run a
            <strong> Dijkstra shortest-path</strong> walk on the OSM road and
            footpath network from the cell centroid. Walking speed is fixed at
            4.8 km/h (80 m/min); the maximum walking budget is 2,400 m
            (corresponding to ~30 min). Every NaPTAN stop reachable inside the
            budget contributes to the AI:
          </p>
          <Math display>
            {String.raw`\text{AI}(g) = \sum_{s \in \text{reachable}(g)} f(s) \cdot w\!\left(\text{walk}(g, s)\right)`}
          </Math>
          <p>
            where <Math>f(s)</Math> is the service frequency at stop
            <Math>s</Math>, <Math>{String.raw`\text{walk}(g, s)`}</Math> is the
            shortest-path walking time, and
            <Math>{String.raw`w(\cdot)`}</Math> is the standard PTAL distance
            decay. The result is mathematically equivalent to TfL's PTAL
            calculation but uses the OSM network instead of straight-line
            distance — meaning a river, a railway cutting or a missing
            footpath actually counts.
          </p>

          {/* ── 5. LTRS ─────────────────────────────────────────────────── */}
          <h2 id="ltrs">5. The Local Transport Resilience Score (LTRS)</h2>
          <p>
            For each grid cell <Math>g</Math> and each set of cancelled routes
            <Math>R</Math>, the disrupted AI is the baseline minus the per-cell
            losses contributed by removing the routes in <Math>R</Math>:
          </p>
          <Math display>
            {String.raw`\text{AI}_{\text{disrupted}}(g, R) = \text{AI}_{\text{baseline}}(g) - \sum_{r \in R} \Delta\text{AI}(g, r)`}
          </Math>
          <p>The LTRS score is then the ratio:</p>
          <Math display>
            {String.raw`\text{LTRS}(g, R) = \frac{\text{AI}_{\text{disrupted}}(g, R)}{\text{AI}_{\text{baseline}}(g)} \in [0, 1]`}
          </Math>
          <p>
            LTRS = 1 means a cell is unaffected by removing <Math>R</Math>;
            LTRS → 0 means total loss. The Network Map's split-screen renders
            baseline AI on the left and the AI-loss percentage
            <Math>{String.raw`(1 - \text{LTRS})`}</Math> on the right, with a
            six-step white→burgundy ramp matching the project's diverging
            palette.
          </p>
          <p>
            The per-route, per-grid loss matrix
            <Math>{String.raw`\Delta\text{AI}(g, r)`}</Math> is{" "}
            <strong>pre-computed once</strong> across all 543 routes
            (route_grid_impacts_osm_network.json, ~13 MB). At interaction time
            the tool just sums losses — that's how cancelling 5 routes
            simultaneously updates 159,000 cells in a few hundred milliseconds.
          </p>

          {/* ── 6. Scenarios ────────────────────────────────────────────── */}
          <h2 id="scenarios">6. The three reference routes (Story + Explorer)</h2>
          <p>
            The <Link to="/">Story</Link> page and the <Link to="/explore">
            Explorer</Link> use three pre-baked routes — <strong>99</strong>,
            <strong> R2</strong>, and <strong>685</strong> — chosen because
            they showcase three distinct spatial signatures of single-route
            failure that recur across the full 543-route data:
          </p>
          <table className="prose-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Affected cells</th>
                <th>Top borough loss</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>99</td>
                <td>1,552 (697 critical)</td>
                <td>Bexley, 18.4 %</td>
                <td>Sharp, deep punch in east London</td>
              </tr>
              <tr>
                <td>R2</td>
                <td>1,738 (542 critical)</td>
                <td>Bromley, 6.3 %</td>
                <td>Widest spread of all 543 routes</td>
              </tr>
              <tr>
                <td>685</td>
                <td>329 (71 critical)</td>
                <td>Croydon, 1.7 %</td>
                <td>Smallest footprint, deepest local impact (38.6 % mean AI loss)</td>
              </tr>
            </tbody>
          </table>
          <p>
            None of these are Tube lines. That is itself a finding — the
            buses, not the Underground, dominate the top of the spatial
            vulnerability ranking, because buses lack parallel substitutes in
            the way Tube lines do.
          </p>

          {/* ── 7. LSOA aggregation ─────────────────────────────────────── */}
          <h2 id="lsoa-aggregation">7. From 100 m grid to LSOA</h2>
          <p>
            For the LSOA-level views in the Story and Explorer, we aggregate
            grid-cell values back up using the official ONS LSOA 2021
            boundaries and the <code>grid_to_lsoa.json</code> mapping
            (157,940 grid → LSOA assignments produced via point-in-polygon at
            grid centroid). For LSOA <Math>i</Math>:
          </p>
          <Math display>
            {String.raw`\text{AI}_{\text{baseline}}(i) = \frac{1}{|G_i|} \sum_{g \in G_i} \text{AI}_{\text{baseline}}(g)`}
          </Math>
          <Math display>
            {String.raw`\text{loss}(i, r) = \frac{1}{|G_i|} \sum_{g \in G_i} \frac{\Delta\text{AI}(g, r)}{\text{AI}_{\text{baseline}}(g)}`}
          </Math>
          <p>
            The choropleth shown in the Story page and the LSOA narrative
            Explorer is exactly this aggregation — every value traces back to
            the same grid-level computation that powers the Network Map.
          </p>

          {/* ── 8. Distribution ─────────────────────────────────────────── */}
          <h2 id="distribution">8. Distributional concentration</h2>
          <p>
            To answer "is loss spread evenly or concentrated?" we report the
            Gini coefficient of the per-LSOA loss distribution:
          </p>
          <Math display>
            {String.raw`G = 1 - 2 \int_0^1 L(x)\,dx`}
          </Math>
          <p>
            where <Math>{String.raw`L(x)`}</Math> is the Lorenz curve. Values
            near zero indicate even spread; values near one indicate
            concentration in a small number of LSOAs. The Explorer renders the
            Lorenz curve directly so the reader can see the integrand.
          </p>

          {/* ── 9. Limitations ──────────────────────────────────────────── */}
          <h2 id="limitations">9. Limitations</h2>
          <ul>
            <li>
              <strong>Static, single-step.</strong> We do not model recovery
              time, cascading effects (a cancelled route may overload its
              alternatives), or capacity-constrained crowding.
            </li>
            <li>
              <strong>Walking only.</strong> The 2,400 m / 30 min budget
              captures walking access; cycling and micro-mobility are not yet
              integrated. A future version will add cycle network density.
            </li>
            <li>
              <strong>Mode-mix simplification.</strong> A "stop" is treated as
              a stop regardless of whether the underlying service is a bus,
              tube, or Overground. Real reliability and service-frequency
              differences are folded into the AI weight but not separately
              visualised.
            </li>
            <li>
              <strong>Modifiable Areal Unit Problem.</strong> LSOA-level
              aggregations smooth out grid-cell heterogeneity. The 100 m grid
              view in the Network Map preserves it.
            </li>
            <li>
              <strong>Population is a flat 1,700 per LSOA</strong> in the
              exposure metric until ONS mid-year estimates are joined.
            </li>
          </ul>

          {/* ── 10. References ──────────────────────────────────────────── */}
          <h2 id="references">10. References</h2>
          <ol className="references">
            <li>
              Bruneau, M. et al. (2003). A framework to quantitatively assess
              and enhance the seismic resilience of communities.{" "}
              <em>Earthquake Spectra</em> 19(4): 733–752.
            </li>
            <li>
              Cats, O. (2016). The robustness value of public transport
              development plans. <em>Journal of Transport Geography</em> 51:
              236–246.
            </li>
            <li>
              Chopra, S. S. et al. (2016). A network-based framework for
              assessing infrastructure resilience: a case study of the London
              metro system. <em>Journal of the Royal Society Interface</em>{" "}
              13(118).
            </li>
            <li>
              Cox, A., Prager, F., &amp; Rose, A. (2011). Transportation
              security and the role of resilience. <em>Transport Policy</em>{" "}
              18(2): 307–317.
            </li>
            <li>
              Derrible, S. &amp; Kennedy, C. (2010). The complexity and
              robustness of metro networks. <em>Physica A</em> 389: 3678–3691.
            </li>
            <li>
              D'Lima, M. &amp; Medda, F. (2016). A new measure of resilience:
              an application to the London Underground.{" "}
              <em>Transportation Research Part A</em> 81: 35–46.
            </li>
            <li>
              Henry, D. &amp; Ramirez-Marquez, J. E. (2012). Generic metrics and
              quantitative approaches for system resilience as a function of
              time. <em>Reliability Engineering &amp; System Safety</em> 99:
              114–122.
            </li>
            <li>
              Jenelius, E. (2010). Redundancy importance: links as rerouting
              alternatives during road network disruptions.{" "}
              <em>Procedia Engineering</em> 3: 129–137.
            </li>
            <li>
              Sharma, D., Zhong, C., &amp; Wong, H. (2024). Lockdown lifted:
              measuring spatial resilience from London's public transport
              demand recovery. <em>Regional Studies, Regional Science</em> 11.
            </li>
            <li>
              Transport for London (2015–2023). <em>WebCAT / PTAL — Public
              Transport Accessibility Level</em>. Methodology note and 2023
              100 m grid release.
            </li>
            <li>
              Department for Transport. <em>NaPTAN — National Public Transport
              Access Nodes</em>. Open Government Licence v3.
            </li>
            <li>
              OpenStreetMap contributors. <em>OSM walking-network extract for
              Greater London</em> (2024). Open Database Licence (ODbL).
            </li>
          </ol>

          <p>
            <Link to="/about">See the About page</Link> for the AI-tool usage
            statement and the full Contributions Table.
          </p>
        </div>
      </article>
    </div>
  );
}
