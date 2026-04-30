import { Link } from "react-router-dom";
import MetricCard from "../ui/MetricCard";

/**
 * Editorial hero. The headline metrics are the *real* size of the underlying
 * LTRS analysis (Siyan Tao's pipeline) — every number traces back to either
 * the OSM-Dijkstra walking model or the route impact pre-computation.
 *
 *   543    — routes covered (Tube + Overground + Elizabeth + DLR + Tramlink + 540+ buses)
 *   159,451 — 100 m grid cells covered by the AI baseline
 *   27,553  — public transport stops in the NaPTAN walking-network model
 */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">London Transit Resilience System</p>
        <h1>
          When London's transport network is disrupted, who still has a way out?
        </h1>
        <p className="hero-subtitle">
          A neighbourhood-scale resilience analysis of London's surface
          transport. We remove one route at a time from the OSM walking
          network, recompute accessibility for every 100 m cell, and ask
          where the loss concentrates — and where alternatives still hold.
        </p>

        <div className="hero-stats">
          <MetricCard
            label="Routes modelled"
            value={543}
            decimals={0}
            note="Tube, Overground, Elizabeth, DLR, Tramlink + 540+ buses"
            highlight
          />
          <MetricCard
            label="100 m grid cells"
            value={159451}
            decimals={0}
            note="Greater London at 100 m × 100 m resolution"
          />
          <MetricCard
            label="Transit stops indexed"
            value={27553}
            decimals={0}
            note="NaPTAN points walked via OSM Dijkstra"
          />
        </div>

        <Link to="/network" className="hero-cta" style={{ marginTop: "var(--space-8)" }}>
          Open the LTRS Network Map →
        </Link>
        <span className="hero-scroll-indicator">Scroll for the story</span>
      </div>
    </section>
  );
}
