export default function ResearchQuestion() {
  return (
    <section className="research-question">
      <p className="eyebrow">Research question</p>
      <blockquote className="rq-quote">
        When a single Underground line is disrupted, which London neighbourhoods
        still have a way out — and which ones don't?
      </blockquote>
      <div className="rq-body">
        <p>
          London's public transport network is celebrated for its density. But density
          is unevenly distributed: inner boroughs can lose a Tube line and still have
          three alternatives. Some outer and mid-ring areas depend on a single corridor
          — and when it fails, there is nothing left.
        </p>
        <p>
          We operationalise this as a <strong>stress test</strong>: we remove one line
          at a time, re-measure local accessibility, and compute four indicators —
          <em> retention</em>, <em>loss</em>, <em>dependency</em>, and
          <em> population exposure</em> — at Lower Super Output Area scale across
          all 4,994 London LSOAs.
        </p>
        <p>
          The result is a spatial inequality map of transport resilience: not a map of
          who has good transport, but a map of <strong>whose transport is brittle</strong>.
        </p>
      </div>
    </section>
  );
}
