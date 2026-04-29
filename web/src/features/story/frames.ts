import type { MapMetric, ScenarioId } from "../../data/schema";

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
  {
    id: "act1-baseline",
    actLabel: "I — The baseline",
    scenario: "central",
    metric: "baseline_ltis",
    tone: "cool",
    captionTitle: "Accessibility is radically unequal before any disruption",
    captionBody:
      "Each polygon is a 2021 LSOA, coloured by its baseline LTIS score derived from PTAL 2023 (TfL). Deep blue = high accessibility; pale = low. The inner city glows; the outer ring fades.",
    paragraphs: [
      "London's transport accessibility is not evenly distributed. 17% of outer-London LSOAs score below 0.1 on our baseline composite — barely one standard deviation above zero. Inner-city LSOAs in the City, Southwark and Islington regularly score above 0.7.",
      "This inequality is the substrate on which any disruption lands. A city where everyone had strong alternatives would be resilient everywhere. London is not that city.",
      "The map here shows not disruption, but health: the starting state that a shock will challenge. Notice the east-west corridor of the Central line — a bright band of accessibility from Ealing to Stratford. That concentration will matter enormously in the next act.",
    ],
  },
  {
    id: "act2-disruption",
    actLabel: "II — Remove the Central line",
    scenario: "central",
    metric: "loss",
    tone: "warm",
    captionTitle: "Newham loses up to 42% of its baseline mobility",
    captionBody:
      "Accessibility loss after removing the Central line. Red-amber zones mark where local fallback mobility drops most sharply. Newham's Stratford corridor has a dependency score of 1.0 — the Central line is its only tube service.",
    paragraphs: [
      "We remove the Central line and re-measure. Most of London barely notices — the Northern, District, Piccadilly and Overground absorb the shock. But along the eastern corridor, a very different story emerges.",
      "In Newham, several LSOAs achieve a Central line dependency score of 1.0: every tube station within walking distance belongs to the Central line. When it closes, tube access drops to zero. Those LSOAs lose between 36% and 42% of their baseline LTIS score.",
      "This is the spatial signature of single-line dependency: high baseline accessibility (the area is well-served in normal conditions) combined with catastrophic fragility (all of that service is one line). Stratford is not a poorly-served edge — it is a well-served but brittle node.",
    ],
  },
  {
    id: "act3-northern",
    actLabel: "III — Switch to the Northern line",
    scenario: "northern",
    metric: "loss",
    tone: "warm",
    captionTitle: "Southwark and Islington: the Northern line's most exposed corridor",
    captionBody:
      "Northern line disruption shifts the vulnerability map south and north. Southwark's Borough/Elephant corridor and Islington's Angel/Highbury belt see losses of 39–45%. The Northern line is London's highest-exposure scenario: 191,000 person-equivalents affected.",
    paragraphs: [
      "Switch to the Northern line and the map changes shape entirely. The eastern exposure disappears; instead, two new clusters emerge — one in south London along the Borough/Elephant & Castle corridor, and one in north London through Islington and Camden.",
      "The Northern line is the most damaging scenario by total exposure: 191,000 person-equivalent units, compared to 120,000 for the Central line and 119,000 for the Jubilee. The branching geometry of the Northern line (running through both the City and the West End) means its corridor touches more high-density areas simultaneously.",
      "In Southwark, the loss Gini coefficient is particularly high — disruption is not spread across the borough but concentrated in specific LSOAs where the Northern line is the dominant connection. This is precisely the spatial inequality pattern the LTIS framework is designed to surface.",
    ],
  },
  {
    id: "act4-exposure",
    actLabel: "IV — Who is actually affected?",
    scenario: "northern",
    metric: "exposure",
    tone: "warm",
    captionTitle: "Loss × population: the equity question",
    captionBody:
      "Exposure = accessibility loss × resident population. Even moderate loss in a dense LSOA produces more exposure than catastrophic loss in a sparse one. This is where resilience becomes an equity issue.",
    paragraphs: [
      "The loss map shows severity. The exposure map shows consequence. The same 30% loss in an LSOA of 1,000 residents and an LSOA of 3,000 residents is not the same social event.",
      "Across all three scenarios, the Gini coefficient of exposure distribution ranges from 0.67 to 0.73. That means this is not a diffuse, city-wide risk — it is highly concentrated. The top 1% of LSOAs absorb between 14% and 19% of total system exposure.",
      "The implication is that targeted resilience interventions — bus frequency uplift, micro-mobility provision, emergency routing — could have outsized impact if directed at a small number of specific corridors. The spatial pattern here is actionable, not just descriptive.",
    ],
  },
];
