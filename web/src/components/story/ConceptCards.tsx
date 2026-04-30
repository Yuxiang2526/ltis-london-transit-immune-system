import Reveal from "../ui/Reveal";

const CARDS = [
  {
    index: "01",
    title: "543 routes, one engine",
    text:
      "The full LTRS analysis covers every Tube line, every Overground branch, the Elizabeth Line, DLR, Tramlink, and 540+ bus routes. Cancel any one — or any combination — and the impact is recomputed live, cell by cell, for the whole catchment.",
    accent: "cool",
  },
  {
    index: "02",
    title: "OSM Dijkstra walking, not Euclidean circles",
    text:
      "Walking accessibility isn't a straight-line distance. We compute it on the actual OpenStreetMap road and footpath network using Dijkstra shortest-path, with a 4.8 km/h walking speed and a 2,400 m budget. Buildings, dead-ends, river crossings — they all matter.",
    accent: "warm",
  },
  {
    index: "03",
    title: "Cancel-and-recompute, not pre-baked scenarios",
    text:
      "The Network Map tool lets you remove any route or set of routes and see the AI score for every grid cell update in real time. The 'before' and 'after' maps sit side-by-side under a draggable splitter. This is forensic resilience analysis.",
    accent: "warm",
  },
];

export default function ConceptCards() {
  return (
    <section className="concept-section" id="concept">
      <div className="section-heading">
        <p className="eyebrow">What the project actually does</p>
        <h2>Three things that make LTRS a real resilience tool, not a status map</h2>
      </div>

      <div className="concept-grid">
        {CARDS.map((card, i) => (
          <Reveal key={card.index} delay={i * 0.1}>
            <article
              className="concept-card"
              style={
                card.accent === "warm"
                  ? { borderTop: "3px solid var(--palette-red-3)" }
                  : { borderTop: "3px solid var(--palette-blue-2)" }
              }
            >
              <span className="concept-index">{card.index}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
