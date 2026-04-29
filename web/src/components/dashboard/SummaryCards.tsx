import type { ScenarioSummaryItem } from "../../types/data";
import { formatPercent, formatPopulation, formatScore } from "../../lib/format";

interface SummaryCardsProps {
  summary: ScenarioSummaryItem;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="summary-card-grid">
      <article className="summary-card">
        <span className="summary-label">Mean retained mobility</span>
        <strong>{formatPercent(summary.meanRetention)}</strong>
      </article>

      <article className="summary-card">
        <span className="summary-label">Mean accessibility loss</span>
        <strong>{formatScore(summary.meanLoss)}</strong>
      </article>

      <article className="summary-card">
        <span className="summary-label">Population exposure</span>
        <strong>{formatPopulation(summary.totalExposedPopulation)}</strong>
      </article>

      <article className="summary-card summary-card-wide">
        <span className="summary-label">Scenario</span>
        <strong>{summary.label}</strong>
        <p>{summary.description}</p>
      </article>
    </div>
  );
}