import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Math from "../components/ui/Math";

/**
 * Methodology page rendered inside the website (rubric requirement: ~1000-word
 * methodology summary, accessible to a general audience, academically
 * rigorous, with clear referencing).
 *
 * Layout: sticky left-side TOC nav (rail-nature reference project pattern)
 * with scroll-spy active state, plus the long-form prose with KaTeX
 * formulas. The single source of truth for the prose is
 * `docs/methodology.md`; this page mirrors it.
 */

const SECTIONS: { id: string; label: string }[] = [
  { id: "research-question", label: "1. Research question" },
  { id: "framework", label: "2. Conceptual framework" },
  { id: "ltis", label: "3. The LTIS score" },
  { id: "scenario", label: "4. Scenario indicators" },
  { id: "distribution", label: "5. Distribution & Gini" },
  { id: "limitations", label: "6. Limitations" },
  { id: "references", label: "7. References" },
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
          <h2>How LTIS is constructed</h2>
          <p className="muted">
            A complete reproducibility manifest is in the repository at{" "}
            <code>docs/methodology.md</code> and{" "}
            <code>docs/decisions/</code>. This page is the public-facing summary.
          </p>
        </div>

        <div className="prose">
          <h2 id="research-question">1. Research question</h2>
          <p>
            How unevenly is transport resilience distributed across London, and
            how do disruptions expose differences in local transport
            substitutability?
          </p>

          <h2 id="framework">2. Conceptual framework</h2>
          <p>
            We adopt a <em>single-step, impact-based</em> definition of
            resilience: the share of baseline accessibility a place retains when
            a specific corridor fails (Jenelius, 2010; D'Lima &amp; Medda, 2016).
            This narrows the broader resilience literature, which spans temporal
            recovery (Bruneau et al., 2003; Henry &amp; Ramirez-Marquez, 2012)
            and topological robustness (Derrible &amp; Kennedy, 2010; Cats,
            2016), to a measure that is computable from open static data and
            decomposes naturally to neighbourhoods. The "immune system" framing
            is editorial; the technical claim is spatial vulnerability under
            disruption.
          </p>

          <h2 id="ltis">3. The Local Transit Immune Score (LTIS)</h2>
          <p>
            For each LSOA <Math>i</Math>, the baseline LTIS combines four
            accessibility components with weights summing to one:
          </p>
          <Math display>
            {String.raw`\text{LTIS}_{\text{baseline}}(i) = w_1 \cdot \widetilde{\text{PTAL}}(i) + w_2 \cdot \widetilde{\text{stops}}(i) + w_3 \cdot H_{\text{mode}}(i) + w_4 \cdot \mu(i)`}
          </Math>
          <p>
            where <Math>{String.raw`\widetilde{\text{PTAL}}`}</Math> is the
            area-weighted PTAL aggregate normalised to{" "}
            <Math>{String.raw`[0, 1]`}</Math>,{" "}
            <Math>{String.raw`\widetilde{\text{stops}}`}</Math> is log-normalised
            NaPTAN stop density, <Math>{String.raw`H_{\text{mode}}`}</Math> is
            the Shannon diversity over the modes serving the LSOA, and{" "}
            <Math>{String.raw`\mu`}</Math> is a supplementary micro-mobility
            term (cycle network density + Santander dock proximity). Initial
            weights are equal (<Math>{String.raw`w_k = 0.25`}</Math>) and the
            robustness of conclusions to weight choice is reported in{" "}
            <code>analysis/04_validate_sensitivity.ipynb</code>.
          </p>

          <h2 id="scenario">4. Scenario indicators</h2>
          <p>
            For each scenario <Math>s</Math> (the failure of one Tube line{" "}
            <Math>{String.raw`\ell_s`}</Math>), we recompute LTIS with the
            stations of <Math>{String.raw`\ell_s`}</Math> removed and derive
            four per-LSOA indicators:
          </p>
          <Math display>
            {String.raw`\text{retention}(i, s) = \frac{\text{LTIS}_{\text{disrupted}}(i, s)}{\text{LTIS}_{\text{baseline}}(i)}`}
          </Math>
          <Math display>
            {String.raw`\text{loss}(i, s) = \max\!\bigl(0,\ 1 - \text{retention}(i, s)\bigr)`}
          </Math>
          <Math display>
            {String.raw`\text{exposure}(i, s) = \text{loss}(i, s) \cdot P(i)`}
          </Math>
          <p>
            where <Math>{String.raw`P(i)`}</Math> is the LSOA's resident
            population. Line dependency follows the impact-based definition of
            Jenelius (2010):
          </p>
          <Math display>
            {String.raw`\text{dependency}(i, s) = \frac{\text{LTIS}_{\text{baseline}}(i) - \text{LTIS}_{\text{disrupted}}(i, s)}{\text{LTIS}_{\text{baseline}}(i)}`}
          </Math>
          <p>
            which approximates the share of local mobility attributable to{" "}
            <Math>{String.raw`\ell_s`}</Math> at <Math>i</Math>.
          </p>

          <h2 id="distribution">5. Distributional concentration</h2>
          <p>
            To answer "is loss spread evenly or concentrated?" we report the
            Gini coefficient of the per-LSOA loss / exposure distributions:
          </p>
          <Math display>
            {String.raw`G = 1 - 2 \int_0^1 L(x)\,dx`}
          </Math>
          <p>
            where <Math>{String.raw`L(x)`}</Math> is the Lorenz curve. Values
            near zero indicate even spread; values near one indicate
            concentration in a small number of LSOAs. The website renders the
            Lorenz curve directly so the reader can see the integrand.
          </p>

          <h2 id="limitations">6. Limitations</h2>
          <ul>
            <li>
              <strong>PTAL vintage (2023)</strong> covers the Elizabeth line
              but does not yet capture proposed extensions such as the Bakerloo
              line; future PTAL releases would shift the baseline.
            </li>
            <li>
              <strong>Static, single-step.</strong> We do not model recovery
              time, cascading effects, or capacity-constrained crowding on
              substitute lines.
            </li>
            <li>
              <strong>Modifiable Areal Unit Problem</strong> — LSOAs are
              statistical, not behavioural; conclusions are sensitive to
              boundary geometry.
            </li>
            <li>
              <strong>Equity weighting</strong> is reported as a secondary
              metric (<Math>{String.raw`\text{loss} \cdot P \cdot D^{-1}`}</Math>{" "}
              with <Math>D</Math> the IMD decile), not as the headline figure.
            </li>
          </ul>

          <h2 id="references">7. References</h2>
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
