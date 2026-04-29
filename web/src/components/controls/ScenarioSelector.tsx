import type { ScenarioId } from "../../types/data";
import { SCENARIOS } from "../../config/scenarios";

interface ScenarioSelectorProps {
  scenario: ScenarioId;
  onScenarioChange: (scenario: ScenarioId) => void;
}

export default function ScenarioSelector({
  scenario,
  onScenarioChange
}: ScenarioSelectorProps) {
  return (
    <label className="control-block">
      <span>Disruption scenario</span>
      <select
        value={scenario}
        onChange={(event) =>
          onScenarioChange(event.target.value as ScenarioId)
        }
      >
        {Object.values(SCENARIOS).map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}