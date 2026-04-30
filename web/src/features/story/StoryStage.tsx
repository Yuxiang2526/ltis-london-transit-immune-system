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
 *
 * Caption duplication note: this component used to render a small caption box
 * over the bottom-left of the map, but the right-column scroll panel already
 * carries the same text. The duplication created visual clutter and
 * (worse) competed with the choropleth signal. Caption is now scroll-only.
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
