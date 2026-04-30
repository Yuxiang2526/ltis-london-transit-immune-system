import { Link } from "react-router-dom";
import { useState } from "react";

import { useLTISDataContext } from "../data/dataContext";

import LTISMap from "../components/map/LTISMap";
import LocalProfile from "../components/dashboard/LocalProfile";
import LorenzCurve from "../features/distribution/LorenzCurve";
import DistributionPanel from "../features/distribution/DistributionPanel";
import DecileBars from "../features/distribution/DecileBars";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/ui/Reveal";

import RouteRankCards from "../features/rankings/RouteRankCards";
import ImpactMatrix from "../features/rankings/ImpactMatrix";
import HeadlineStrip from "../features/rankings/HeadlineStrip";

import type { LSOAFeature } from "../data/schema";
import { DEFAULT_SCENARIO_ID } from "../data/scenarios";

/**
 * Explorer (LSOA narrative overview)
 * ----------------------------------
 * Composed of three editorial blocks:
 *
 *   1. Findings — "Five routes that matter most" rank cards + Impact matrix
 *      heatmap. Pulled from Siyan's resilience_summary_osm_network.json
 *      (route_rankings.json), rendered with the project palette.
 *
 *   2. Map + LocalProfile — the LSOA-level baseline accessibility choropleth
 *      with a side panel that updates on hover/click.
 *
 *   3. Distribution — Lorenz curve of the baseline distribution (one
 *      number — the Gini — that sums up the spatial inequality argument).
 *
 *   4. CTA into the forensic Network Map.
 */
export default function ExploreRoute() {
  const { lsoaData } = useLTISDataContext();
  const [selectedFeature, setSelectedFeature] = useState<LSOAFeature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<LSOAFeature | null>(null);
  const focusFeature = selectedFeature ?? hoveredFeature;

  return (
    <section className="analytics-shell" id="explore">
      {/* ───── Headline numbers strip ───── */}
      <Reveal>
        <HeadlineStrip />
      </Reveal>

      {/* ───── Section: rank cards ───── */}
      <Reveal delay={0.04}>
        <div style={{ marginTop: "var(--space-12)" }}>
          <SectionHeader
            badge="01"
            tone="warm"
            eyebrow="Routes ranking · top 5"
            title="Five routes that matter most — and why."
            description="Across 418 regular London routes, these five strip the most neighbourhoods of their 12-minute walking access when cancelled. Every winner is an outer-London route — places where alternatives are scarce."
          />
          <RouteRankCards />
        </div>
      </Reveal>

      {/* ───── Section: impact matrix ───── */}
      <Reveal delay={0.08}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="02"
            tone="warm"
            eyebrow="Impact matrix · top 10 × four metrics"
            title="One row, one route. Four ways the city loses."
            description="Each cell is normalised across all 418 regular London routes — darker terracotta means a larger relative impact on that metric. Reading horizontally tells you a route's signature; reading vertically tells you which routes dominate that dimension."
          />
          <ImpactMatrix />
        </div>
      </Reveal>

      {/* ───── Section: Map + Local profile (cool palette) ───── */}
      <Reveal delay={0.1}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="03"
            tone="cool"
            eyebrow="LSOA baseline accessibility"
            title="Hover any neighbourhood, inspect its profile."
            description="The choropleth shows the percentile rank of each LSOA's baseline accessibility. Hover or click any LSOA to drill into its profile."
          />

          <div className="dashboard-grid">
            <div className="map-card">
              <LTISMap
                data={lsoaData}
                scenario={DEFAULT_SCENARIO_ID}
                metric="baseline_ltis"
                selectedFeature={selectedFeature}
                onSelectFeature={setSelectedFeature}
                onHoverFeature={setHoveredFeature}
              />
            </div>
            <aside className="side-panel">
              <LocalProfile
                feature={focusFeature}
                scenario={DEFAULT_SCENARIO_ID}
                onSelectFeature={setSelectedFeature}
              />
            </aside>
          </div>
        </div>
      </Reveal>

      {/* ───── Section: Distribution (cool palette) ───── */}
      <Reveal delay={0.12}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="04"
            tone="cool"
            eyebrow="Distributional concentration"
            title="Where loss accumulates — quantified."
            description="Three complementary views of the same accessibility distribution: a Lorenz curve, the headline shares, and decile bars. Read them together."
          />

          {/* Lorenz curve + distribution stats panel side by side */}
          <div className="distribution-grid">
            <LorenzCurve
              data={lsoaData}
              scenario={DEFAULT_SCENARIO_ID}
              metric="baseline_ltis"
            />
            <DistributionPanel />
          </div>

          {/* Decile bars below */}
          <div style={{ marginTop: "var(--space-6)" }}>
            <DecileBars />
          </div>
        </div>
      </Reveal>

      {/* ───── Section: Key findings ───── */}
      <Reveal delay={0.13}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="05"
            tone="warm"
            eyebrow="What the data tells us"
            title="Three findings the maps converge on."
            description="Reading the rankings, the choropleth and the Lorenz curve together, the same story repeats."
          />
          <div className="findings-grid">
            <article className="finding-card finding-card--warm">
              <p className="finding-card__num num-mono">01</p>
              <h3>The most disruptive routes are buses, not the Tube.</h3>
              <p>
                The top-5 routes by lost 12-min access are <strong>all
                outer-London bus routes</strong>. Tube and rail lines have
                parallel substitutes — a single bus route in Bexley or
                Croydon does not.
              </p>
            </article>
            <article className="finding-card finding-card--warm">
              <p className="finding-card__num num-mono">02</p>
              <h3>Loss is sharp, not spread.</h3>
              <p>
                Of all 4,994 LSOAs, only <strong>87</strong> register any loss
                at all when route 99 fails — and just <strong>~3 boroughs</strong>{" "}
                absorb the entire impact. Vulnerability is geographically
                concentrated, not city-wide.
              </p>
            </article>
            <article className="finding-card finding-card--cool">
              <p className="finding-card__num num-mono">03</p>
              <h3>Inequality precedes disruption.</h3>
              <p>
                Even before any route is cancelled, accessibility ranges from
                AI ≈ 0.04 in the most isolated LSOAs to AI ≈ 119.7 in the
                City — a <strong>~3,000× spread</strong>. Disruption lands on
                an already-uneven surface.
              </p>
            </article>
          </div>
        </div>
      </Reveal>

      {/* ───── Section: Planning implications ───── */}
      <Reveal delay={0.14}>
        <div style={{ marginTop: "var(--space-16)" }}>
          <SectionHeader
            badge="06"
            tone="warm"
            eyebrow="Planning implications"
            title="What this means for TfL and borough planners."
            description="Resilience is not equally distributed; targeted interventions matter more than uniform service uplifts."
          />
          <ul className="implications-list">
            <li>
              <strong>Outer-London corridors need redundancy, not frequency.</strong>{" "}
              Routes 99 (Bexley), R2 (Bromley) and 685 (Croydon) absorb almost
              all the LSOA-level loss in our top scenarios. Adding a parallel
              service — even a low-frequency one — would convert each from a
              single point of failure into a pair.
            </li>
            <li>
              <strong>The Tube is the wrong lens.</strong> Resilience analysis
              focused on Tube line failures misses where the real fragility
              sits. Bus-network depth, not rail topology, drives outer-London
              accessibility.
            </li>
            <li>
              <strong>Equity-aware route ranking is feasible from open data.</strong>{" "}
              Every number in this Explorer comes from public datasets (PTAL,
              NaPTAN, OSM, ONS LSOA). Boroughs can run the same scenario for
              their own corridor without commissioning a bespoke study.
            </li>
            <li>
              <strong>Indicative exposure is a starting point, not the headline.</strong>{" "}
              Joining ONS mid-year LSOA population (a single CSV) sharpens the
              "how many people" answer. The methodology and code are ready
              for that join.
            </li>
          </ul>
        </div>
      </Reveal>

      {/* ───── CTA to Network Map ───── */}
      <Reveal delay={0.16}>
        <div className="story-cta" style={{ marginTop: "var(--space-16)" }}>
          <div>
            <p className="eyebrow">Want full control?</p>
            <h2>Switch to the Network Map for 543 routes &amp; 100 m grids</h2>
            <p className="muted">
              The LTRS Network Map lets you cancel any combination of routes,
              navigate to any borough or postcode, and inspect resilience at
              100 m grid resolution. This Explorer is the LSOA-scale narrative
              overview; the Network Map is the forensic tool.
            </p>
          </div>
          <Link to="/network" className="hero-cta">
            Open the Network Map →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
