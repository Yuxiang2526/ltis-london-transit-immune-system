export default function ResearchQuestion() {
  return (
    <section className="research-question">
      <p className="eyebrow">Research question</p>
      <blockquote className="rq-quote">
        How unevenly is transport resilience distributed across London, and how
        do single-route disruptions expose differences in local
        substitutability?
      </blockquote>
      <div className="rq-body">
        <p>
          London's surface transport is celebrated for its density. But density
          is unevenly distributed. Inner boroughs can lose a route and still
          have multiple alternatives within a 10-minute walk. Some outer and
          mid-ring areas depend on a single corridor — and when it fails, the
          OSM walking-network walker can't find anything else inside its 2,400 m
          budget.
        </p>
        <p>
          We operationalise this as a <strong>cancel-and-recompute stress
          test</strong>: for each of 543 routes, we delete it from the network,
          rerun the Dijkstra walker for every affected 100 m grid cell, and
          aggregate the loss back to neighbourhoods. The resulting map shows
          not who has good transport, but <strong>whose transport is
          brittle</strong>.
        </p>
        <p>
          The Story page below walks through three example routes with very
          different spatial signatures. The Network Map tool lets you do the
          same for any route — or combination of routes — at full 100 m grid
          resolution.
        </p>
      </div>
    </section>
  );
}
