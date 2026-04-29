import type { LSOAFeatureCollection } from "../../data/schema";
import type { StoryFrame } from "./frames";
import LTISMap from "../../components/map/LTISMap";

interface StoryStageProps {
  data: LSOAFeatureCollection;
  frame: StoryFrame;
}

/**
 * The sticky visual that the scrolling narrative drives. It is the same
 * underlying map for all acts — what changes is the scenario, metric,
 * highlighted feature, and (eventually) overlay layers like the disrupted
 * Tube line and call-out annotations.
 *
 * Future overlays (TubeLineLayer, AnnotationLayer, SmallMultiplesLayer) will
 * be slotted in here, conditionally rendered by `frame.overlays`.
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

      <div className="story-stage-caption" data-tone={frame.tone}>
        <span className="step-eyebrow">Act · {frame.actLabel}</span>
        <h4>{frame.captionTitle}</h4>
        <p>{frame.captionBody}</p>
      </div>
    </div>
  );
}
