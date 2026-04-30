import type { LSOAFeatureCollection } from "../../data/schema";
import type { StoryFrame } from "./frames";
import LTISMap from "../../components/map/LTISMap";

interface StoryStageProps {
  data: LSOAFeatureCollection;
  frame: StoryFrame;
}

/**
 * The sticky visual that the scrolling narrative drives. Same map underneath
 * for all acts — what changes is the scenario (paint expression), the camera
 * (flyTo into the affected borough), the spotlight ring, and the small
 * headline-stats strip overlaid in the top-left.
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
        view={frame.view ?? null}
        spotlight={frame.view?.spotlight ?? null}
      />
      {frame.headlineStats?.length ? (
        <div
          className={`story-headline-stats story-headline-stats--${frame.tone}`}
          aria-hidden="true"
        >
          {frame.headlineStats.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className={`story-headline-stat story-headline-stat--${s.tone}`}
            >
              <strong
                className="story-headline-stat__value num-mono"
                dangerouslySetInnerHTML={{ __html: s.value }}
              />
              <span className="story-headline-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
