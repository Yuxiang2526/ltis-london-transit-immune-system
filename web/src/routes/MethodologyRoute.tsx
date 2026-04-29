import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Math from "../components/ui/Math";

/**
 * Methodology page (rubric requirement: ~1000 word methodology summary,
 * accessible to a general audience, academically rigorous, with clear
 * referencing).
 *
 * The project ships TWO complementary analytical layers, each with its own
 * spatial unit and indicator family:
 *
 *   1. LTIS (Story + Explorer) — LSOA-level composite indicator built from
 *      PTAL 2023 + Underground line dependency. Optimised for narrative
 *      overview at city scale.
 *
 *   2. LTRS / Network Map — 100 m grid resilience computed via OSM
 *      road-network Dijkstra shortest paths against 543 routes. Optimised
 *      for forensic, route-by-route inspection.
 *
 * Layout: sticky left-side TOC nav (rail-nature reference pattern) with
 * scroll-spy active state, plus the long-form prose with KaTeX formulas.
 * Single source of truth for the prose is `docs/methodology.md`.
 */

const SECTIONS: { id: string; label: string }[] = [
  { id: "research-question", label: "1. Research question" },
  { id: "framework", label: "2. Conceptual framework" },
  { id: "two-layers", label: "3. Two analytical layers" },
  { id: "ltis", label: "4. LTIS (LSOA scale)" },
  { id: "ltrs", label: "5. LTRS (100m grid)" },
  { id: "distribution", label: "6. Distribution & Gini" },
  { id: "limitations", label: "7. Limitations" },
  { id: "references", label: "8. References" },
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
          <a
            key={s.id}
            href={`#${s.id}`}
            className={active === s.id ? "is-active" : ""}
          >
            {s.label}
          </a>
        ))}
      </aside>

      <article className="methodology-panel" id="methodology">
        <div className="section-heading">
          <p className="eyebrow">Methodology</p>
          <h2>How LTIS &amp; LTRS are constructed</h2>
          <p className="muted">
            This page summarises the methods behind the project's two
            complementary analytical layers — the LSOA-level LTIS narrative
            and the 100 m-grid LTRS network explorer. A complete reproducibility
            manifest is in <code>docs/methodology.md</code> and{" "}
            <code>docs/decisions/</code>.
          </p>
        </div>

        <div className="prose">
          {/* ── 1. Research question ─────────────────────────────────────── */}
          <h2 id="research-question">1. Research question</h2>
          <p>
            How unevenly is transport resilience distributed across London, and
            how do disruptions expose differences in local transport
            substitutability?
          </p>

          {/* ── 2. Conceptual framework ──────────────────────────────────── */}
          <h2 id="framework">2. Conceptual framework</h2>
          <p>
            We adopt a <em>single-step, impact-based</em> definition of
            resilience: the share of baseline accessibility a place retains when
            a specific corridor fails (Jenelius, 2010; D'Lima &amp; Medda, 2016).
            This narrows the broader resilience literature, which spans temporal
            recovery (Bruneau et al., 2003; Henry &amp; Ramirez-Marquez, 2012)
            and topological robustness (Derrible &amp; Kennedy, 2010; Cats,
            2016), to a measure that is computable from open static data and
            decomposes naturally to neighbourhoods.
          </p>
          <p>
            "Immune system" framing is editorial; the technical claim is
            spatial vulnerability under disruption. Resilience = retained
            mobility after disruption.
          </p>

          {/* ── 3. Two analytical layers ─────────────────────────────────── */}
          <h2 id="two-layers">3. Two analytical layers</h2>
          <p>
            Resilience is hard to capture with a single indicator, so the
            project ships <strong>two independent but complementary
            measurement layers</strong>. Both consume the same source datasets
            (PTAL 2023, NaPTAN, OSM, ONS LSOA boundaries) but make different
            spatial and computational trade-offs:
          </p>

          <table className="prose-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>LTIS (Story + Explorer)</th>
                <th>LTRS (Network Map)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Spatial unit</td>
                <td>2021 LSOA (4,994 polygons)</td>
                <td>100 m grid cell (~159k cells)</td>
              </tr>
              <tr>
                <td>Disruption granularity</td>
                <td>3 Underground lines</td>
                <td>543 routes (Tube + Overground + Elizabeth + DLR + Tramlink + buses)</td>
              </tr>
              <tr>
                <td>Walking accessibility</td>
                <td>Euclidean catchment ≈ 1.3 km</td>
                <td>OSM Dijkstra shortest path, 4.8 km/h, 2,400 m cap</td>
              </tr>
              <tr>
                <td>Optimised for</td>
                <td>City-wide overview, narrative</td>
                <td>Forensic single-route impact, comparison view</td>
              </tr>
              <tr>
                <td>Where</td>
                <td><Link to="/">Story</Link> · <Link to="/explore">Explorer</Link></td>
                <td><Link to="/network">Network Map</Link></td>
              </tr>
            </tbody>
          </table>

          <p>
            The LTIS layer answers <em>"where is mobility brittle, and what is
            the city-wide pattern?"</em>. The LTRS layer answers{" "}
            <em>"how exactly does cancelling this specific route reshape
            walking-time accessibility, cell by cell?"</em>. Reading them
            together gives both the narrative and the mechanism.
          </p>

          {/* ── 4. LTIS ─────────────────────────────────────────────────── */}
          <h2 id="ltis">4. The Local Transit Immune Score (LTIS)</h2>
          <p>
            For each LSOA <Math>i</Math>, the baseline LTIS combines a
            normalised PTAL signal with a normalised dominant PTAL band:
          </p>
          <Math display>
            {String.raw`\text{LTIS}_{\text{baseline}}(i) = 0.6 \cdot \widetilde{\text{AI}}(i) + 0.4 \cdot \text{ptalNorm}(i)`}
          </Math>
          <p>
            where <Math>{String.raw`\widetilde{\text{AI}}`}</Math> is the
            min–max normalised <code>mean_AI</code> from the PTAL 2023 LSOA
            aggregate and <Math>{String.raw`\text{ptalNorm}`}</Math> is the
            dominant PTAL band ("0"…"6b") mapped to <Math>[0,1]</Math>.
          </p>
          <p>
            For each scenario <Math>s</Math> (failure of one Tube line{" "}
            <Math>{String.raw`\ell_s`}</Math>), we identify the stations
            belonging to <Math>{String.raw`\ell_s`}</Math> within an
            approximately 1.3 km Euclidean catchment of the LSOA centroid and
            derive a dependency share:
          </p>
          <Math display>
            {String.raw`\text{dependency}(i, s) = \frac{|\text{stations on }\ell_s \text{ in catchment}|}{|\text{all stations in catchment}|}`}
          </Math>
          <p>The disruption indicators follow:</p>
          <Math display>
            {String.raw`\text{loss}(i,s) = \text{LTIS}_{\text{baseline}}(i) \cdot \text{dependency}(i,s) \cdot 0.55`}
          </Math>
          <Math display>
            {String.raw`\text{retention}(i,s) = \text{LTIS}_{\text{baseline}}(i) - \text{loss}(i,s)`}
          </Math>
          <Math display>
            {String.raw`\text{exposure}(i,s) = \text{loss}(i,s) \cdot P(i)`}
          </Math>
          <p>
            where <Math>P(i)</Math> is resident population. The 0.55 severity
            coefficient is documented as ADR-002 — it expresses the assumption
            that even total dependency does not zero out mobility (bus and
            walking remain).
          </p>
          <p>
            The five-dimension fallback profile rendered in the Local Profile
            radar — <em>redundancy</em>, <em>busFallback</em>,{" "}
            <em>cycleFallback</em>, <em>modalDiversity</em>,{" "}
            <em>dependencyRisk</em> — is derived from the same baseline plus
            dependency.
          </p>

          {/* ── 5. LTRS ─────────────────────────────────────────────────── */}
          <h2 id="ltrs">5. The Local Transport Resilience Score (LTRS)</h2>
          <p>
            The LTRS layer (<Link to="/network">Network Map</Link>) is the
            Network Map embed by Siyan Tao. Where LTIS approximates walking
            accessibility with a Euclidean catchment, LTRS computes it on the
            real OpenStreetMap road network:
          </p>
          <ul>
            <li>
              4,994 LSOAs × 27,553 stops, walking-time matrix pre-computed via
              <strong> Dijkstra shortest path</strong> on the OSM walking
              network.
            </li>
            <li>
              Walking speed 4.8 km/h (80 m/min); maximum network walking
              distance 2,400 m.
            </li>
            <li>
              Per-stop accessibility contribution converted into the standard
              TfL AI score, aggregated to 100 m grid cells (~159,000 cells).
            </li>
            <li>
              For each of 543 routes, the AI loss when that route is removed is
              pre-computed for every grid cell; cancelling multiple routes sums
              their per-cell loss contributions.
            </li>
          </ul>
          <p>The LTRS for grid cell <Math>g</Math> under route set <Math>R</Math> is:</p>
          <Math display>
            {String.raw`\text{LTRS}(g, R) = \frac{\text{AI}_{\text{disrupted}}(g, R)}{\text{AI}_{\text{baseline}}(g)}`}
          </Math>
          <p>
            where <Math>{String.raw`\text{AI}_{\text{disrupted}}(g, R)`}</Math>{" "}
            is the baseline AI minus the per-route losses for routes in <Math>R</Math>.
            LTRS = 1 means the cell is unaffected; LTRS → 0 means total loss.
            The compare-mode split-screen renders baseline AI on the left and
            disruption-induced AI loss percentage on the right, with a six-step
            white→burgundy ramp matching the project's diverging palette.
          </p>

          {/* ── 6. Distribution ─────────────────────────────────────────── */}
          <h2 id="distribution">6. Distributional concentration</h2>
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
            concentration in a small number of LSOAs. The website renders the
            Lorenz curve directly in the Explorer so the reader can see the
            integrand. For LTIS, the Gini ranges from 0.67 to 0.73 across the
            three scenarios — meaning loss is highly concentrated, not diffuse.
          </p>

          {/* ── 7. Limitations ──────────────────────────────────────────── */}
          <h2 id="limitations">7. Limitations</h2>
          <ul>
            <li>
              <strong>Static, single-step.</strong> Neither LTIS nor LTRS
              models recovery time, cascading effects, or capacity-constrained
              crowding on substitute lines.
            </li>
            <li>
              <strong>LTIS catchment is Euclidean</strong> (~1.3 km radius),
              not network-walked. LTRS exists precisely to provide the
              network-walked counterpart for areas where this matters.
            </li>
            <li>
              <strong>LTRS line geometry</strong> for the LTIS overlay is
              approximated by chaining each line's stations west-to-east with
              a nearest-neighbour walk, used as a visual scaffold only.
            </li>
            <li>
              <strong>Modifiable Areal Unit Problem</strong> — LSOAs are
              statistical, not behavioural. The 100 m LTRS grid mitigates this
              partially but adds its own grid-edge artifacts.
            </li>
            <li>
              <strong>Population data</strong> currently uses a fixed per-LSOA
              estimate; an upgrade using the live ONS mid-year estimates is
              on the project roadmap (D5 in the analysis pipeline).
            </li>
          </ul>

          {/* ── 8. References ───────────────────────────────────────────── */}
          <h2 id="references">8. References</h2>
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
              security and the role of resilience.{" "}
              <em>Transport Policy</em> 18(2): 307–317.
            </li>
            <li>
              Derrible, S. &amp; Kennedy, C. (2010). The complexity and
              robustness of metro networks. <em>Physica A</em> 389: 3678–3691.
            </li>
            <li>
              D'Lima, M. &amp; Medda, F. (2016). A new measure of resilience: an
              application to the London Underground.{" "}
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
              LSOA aggregate.
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
