import type { LSOAFeatureCollection } from "../../data/schema";
import type { StoryFrame } from "./frames";
import LTISMap from "../../components/map/LTISMap";

interface StoryStageProps {
  data: LSOAFeatureCollection;
  frame: StoryFrame;
}

/**
 * The sticky visual that the scrolling narrative drives. It is the same
 * underlying map for all acts — what changes is the scenario, metric, and
 * (eventually) overlay layers.
 */
export default function StoryStage({ data, frame }: StoryStageProps) {
  return (
    <div className="story-stage">
      <LTISMap
        data={data}
        scenario={frame.scenario}
        metric={frame.metric}
        selectedFeature={null}
        onSelectFeature={() => {}}
        onHoverFeature={() => {}}
      />
    </div>
  );
}
