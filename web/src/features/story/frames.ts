import type { MapMetric, ScenarioId } from "../../data/schema";

/**
 * StoryFrame — one snapshot of map state + caption shown by the scrolling
 * narrative. Editing this file is the only thing required to add / reorder /
 * relabel acts.
 *
 * Numbers used in copy are NOT placeholders — they are computed in
 * `analysis/build_ltis_from_lsoa_summary.py` from Siyan Tao's
 * route_grid_impacts_osm_network.json (OSM-Dijkstra pipeline) and aggregated
 * to LSOA via grid_to_lsoa.json. The same values appear, cell-by-cell, in the
 * Network Map iframe at /network — both views consume the same underlying
 * computation.
 */
export interface StoryFrame {
  id: string;
  actLabel: string;
  scenario: ScenarioId;
  metric: MapMetric;
  tone: "neutral" | "warm" | "cool";
  captionTitle: string;
  captionBody: string;
  paragraphs: string[];
  spotlight?: string[];
}

export const STORY_FRAMES: StoryFrame[] = [
  // ────── ACT I — Baseline ────────────────────────────────────────────────
  {
    id: "act1-baseline",
    actLabel: "I — The uneven baseline",
    scenario: "99",
    metric: "baseline_ltis",
    tone: "cool",
    captionTitle: "London's accessibility is radically uneven before any disruption",
    captionBody:
      "Each polygon is a 2021 LSOA, coloured by its baseline accessibility index (AI) — the average AI of all 100 m grid cells inside it, computed from the OSM walking network reaching 27,553 transit stops. Inner boroughs glow at AI > 50; some outer LSOAs fall below 5.",
    paragraphs: [
      "London's transport accessibility is not evenly distributed. The baseline AI we compute from the full OSM walking network spans more than two orders of magnitude — from 0.04 in the most isolated LSOAs to 119.7 in the City. That's the substrate any disruption lands on.",
      "This unevenness is not a flaw of the visualisation — it is the central finding. A city where everyone had strong fallback options would be resilient everywhere. London is not that city.",
      "The map here shows the healthy baseline. The next three acts each remove one bus route from the network and re-measure. We start with route 99.",
    ],
  },

  // ────── ACT II — Route 99 ───────────────────────────────────────────────
  {
    id: "act2-route-99",
    actLabel: "II — Cancel bus route 99",
    scenario: "99",
    metric: "loss",
    tone: "warm",
    captionTitle: "Route 99 fails: Bexley's accessibility drops by 18% on average",
    captionBody:
      "Mean accessibility loss after removing route 99 from the OSM walking network. The bus is not a Tube line — but its removal pushes 697 grid cells across south-east London into the 'critical' loss band. Mean affected loss: 18.4 % in Bexley, 4.8 % in Greenwich.",
    paragraphs: [
      "We remove route 99 — a single London bus — and recompute accessibility for every 100 m grid cell on its catchment. Then we average back up to LSOAs. The loss map you see is real: Siyan's pipeline ran the OSM-Dijkstra walker on every cell.",
      "Most of London is white. That is not a rendering glitch — it is the finding. Bus 99's impact is highly localised. But where it lands, it lands hard: Bexley LSOAs lose 18.4 % of accessibility on average, with individual cells dropping above 30 %.",
      "This is the spatial signature of single-route dependency. A neighbourhood doesn't have to be remote to be brittle — it has to be served by routes that don't have parallel substitutes. Bexley's eastern corridor is exactly that.",
    ],
  },

  // ────── ACT III — Route R2 ──────────────────────────────────────────────
  {
    id: "act3-route-R2",
    actLabel: "III — Cancel bus route R2",
    scenario: "R2",
    metric: "loss",
    tone: "warm",
    captionTitle: "Route R2: 1,738 affected grid cells, Bromley loses 6.3%",
    captionBody:
      "Route R2 has the widest spatial spread of all 543 routes — 1,738 grid cells affected. The geometry shifts south. Where route 99 punched a hole in the east, R2 carves a shallow corridor across south London.",
    paragraphs: [
      "Switch the disruption to bus R2 and the map rotates south. Bromley LSOAs absorb the largest borough-level loss (6.3 %), but the affected area is much wider than route 99's footprint.",
      "This is the trade-off between depth and spread. R2 affects more grids but each grid loses less, on average. From a planner's perspective, R2 is a 'broad fragility' route; route 99 is a 'sharp fragility' route. Both demand attention but require different responses.",
      "The same 543-route engine that lets us swap from 99 to R2 in this narrative powers the Network Map tool. There, you can cancel any combination of routes and watch the whole map recompute live.",
    ],
  },

  // ────── ACT IV — Route 685 ──────────────────────────────────────────────
  {
    id: "act4-route-685",
    actLabel: "IV — Cancel bus route 685",
    scenario: "685",
    metric: "loss",
    tone: "warm",
    captionTitle: "Route 685: smaller footprint, deepest local punch",
    captionBody:
      "Route 685 affects only 329 grid cells — the smallest footprint of our three scenarios. But where it touches, it dominates. Croydon LSOAs along its corridor lose up to 38.6 % of mean AI. This is single-line dependency in its purest form.",
    paragraphs: [
      "Route 685 is the third archetype: small footprint, deep punch. Only Croydon shows up in the borough rankings (1.7 % mean), but the LSOAs that depend on it lose almost 40 % of their accessibility when it's cancelled.",
      "These are the LSOAs where 685 is essentially the only viable bus route. There is no parallel service to absorb the shock. The OSM-Dijkstra walker can't find alternative stops within the 2,400 m walking budget.",
      "Three routes. Three spatial signatures. Wide-shallow, medium-medium, narrow-deep. The full data has 540 more routes — and many of them follow these three patterns. That is the structural vulnerability map of London's surface transport.",
    ],
  },
];
