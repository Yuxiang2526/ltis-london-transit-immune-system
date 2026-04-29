import Reveal from "../ui/Reveal";

const CARDS = [
  {
    index: "01",
    title: "An unequal baseline",
    text:
      "Before any disruption, London's transport accessibility is already deeply unequal. Inner boroughs achieve LTIS scores above 0.7; 17% of outer-London LSOAs score below 0.1. The same disruption does not land on a flat surface.",
    accent: "cool",
  },
  {
    index: "02",
    title: "Single-line dependency creates fragility",
    text:
      "When a line fails, the places hardest hit are not always the least served — they are those that depend on one corridor with no alternative. In Newham, Central line stations account for 100% of nearby tube access.",
    accent: "warm",
  },
  {
    index: "03",
    title: "Loss is highly concentrated",
    text:
      "Across all three disruption scenarios, the Gini coefficient of accessibility loss ranges from 0.67 to 0.73. The top 1% of LSOAs absorb 14–19% of total system loss. Disruption risk is not shared equally.",
    accent: "warm",
  },
];

export default function ConceptCards() {
  return (
    <section className="concept-section" id="concept">
      <div className="section-heading">
        <p className="eyebrow">What we find</p>
        <h2>Three things the data reveals about London's transport resilience</h2>
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
