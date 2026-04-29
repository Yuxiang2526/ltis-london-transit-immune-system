import type { MetricId } from "../../types/data";
import { METRICS } from "../../config/metrics";

interface MetricSelectorProps {
  metric: MetricId;
  onMetricChange: (metric: MetricId) => void;
}

export default function MetricSelector({
  metric,
  onMetricChange
}: MetricSelectorProps) {
  return (
    <label className="control-block">
      <span>Map metric</span>
      <select
        value={metric}
        onChange={(event) => onMetricChange(event.target.value as MetricId)}
      >
        {Object.values(METRICS).map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}