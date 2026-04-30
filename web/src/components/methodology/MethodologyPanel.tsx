export default function MethodologyPanel() {
  return (
    <section className="methodology-panel" id="methodology">
      <div className="section-heading">
        <p className="eyebrow">Methodology</p>
        <h2>How LTRS is constructed</h2>
      </div>

      <div className="method-grid">
        <article>
          <h3>Step 1 — Healthy baseline</h3>
          <p>
            We use PTAL-informed accessibility as the baseline condition of the
            city, combined with stop supply, mode diversity and local fallback
            mobility indicators.
          </p>
        </article>

        <article>
          <h3>Step 2 — Inject disruption</h3>
          <p>
            Selected Tube line disruptions are treated as stress tests. We
            compare normal accessibility against disrupted conditions to reveal
            uneven neighbourhood dependence.
          </p>
        </article>

        <article>
          <h3>Step 3 — Resilience response</h3>
          <p>
            We calculate retained mobility, accessibility loss, population
            exposure and line dependency to estimate how well different places
            absorb transport shocks.
          </p>
        </article>

        <article>
          <h3>Important boundary</h3>
          <p>
            LTRS is a scenario-based proxy rather than an official TfL PTAL
            recalculation. Its purpose is comparative urban analysis and
            storytelling, not operational transport planning.
          </p>
        </article>
      </div>
    </section>
  );
}