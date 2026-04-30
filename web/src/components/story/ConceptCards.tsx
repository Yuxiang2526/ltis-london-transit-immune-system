import { type ReactElement } from "react";
import Reveal from "../ui/Reveal";

interface ConceptCard {
  index: string;
  title: string;
  text: string;
  accent: "cool" | "warm";
  icon: ReactElement;
}

const CARDS: ConceptCard[] = [
  {
    index: "01",
    title: "An unequal baseline",
    text:
      "Before any disruption, London's transport accessibility is already deeply unequal. Inner boroughs achieve LTRS scores above 0.7; 17% of outer-London LSOAs score below 0.1. The same disruption does not land on a flat surface.",
    accent: "cool",
    // Concentric rings — accessibility "field"
    icon: (
      <svg viewBox="0 0 48 48" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="4" />
        <circle cx="24" cy="24" r="10" opacity="0.7" />
        <circle cx="24" cy="24" r="16" opacity="0.45" />
        <circle cx="24" cy="24" r="22" opacity="0.2" />
      </svg>
    ),
  },
  {
    index: "02",
    title: "Single-route dependency creates fragility",
    text:
      "When a route fails, the places hardest hit are not always the least served — they are those that depend on one corridor with no parallel substitute. Five outer-London bus routes alone strip 12-minute access from 47 distinct LSOAs.",
    accent: "warm",
    // Single line with a break — fragility
    icon: (
      <svg viewBox="0 0 48 48" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
        <path d="M4 24h14" strokeLinecap="round" />
        <path d="M30 24h14" strokeLinecap="round" />
        <path d="M19 24l4 -4M22 24l4 4" strokeLinecap="round" />
        <circle cx="4" cy="24" r="2" fill="currentColor" stroke="none" />
        <circle cx="44" cy="24" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    index: "03",
    title: "Loss is highly concentrated",
    text:
      "Across all 418 regular routes, the top 10 routes alone account for 41% of all 12-minute-access losses across London. Disruption risk is not evenly shared — it concentrates on a handful of fragile corridors.",
    accent: "warm",
    // Bar chart — concentration
    icon: (
      <svg viewBox="0 0 48 48" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true">
        <path d="M6 42v-8M14 42v-16M22 42v-22M30 42v-30M38 42v-12" strokeLinecap="round" />
        <path d="M4 42h40" strokeLinecap="round" />
      </svg>
    ),
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
            <article className={`concept-card concept-card--${card.accent}`}>
              <span
                className={`concept-card__icon concept-card__icon--${card.accent}`}
                aria-hidden="true"
              >
                {card.icon}
              </span>
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
