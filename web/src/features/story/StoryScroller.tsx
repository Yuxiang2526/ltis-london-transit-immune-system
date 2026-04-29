import type { LSOAFeatureCollection } from "../../data/schema";
import ScrollStage from "./ScrollStage";
import StoryStage from "./StoryStage";
import { STORY_FRAMES } from "./frames";

interface StoryScrollerProps {
  data: LSOAFeatureCollection;
}

/**
 * The full three-act narrative. Reads frames from `frames.ts`, keeps the map
 * sticky on the left, lets the editorial paragraphs scroll on the right, and
 * swaps the map's scenario / metric in lockstep with the active step.
 */
export default function StoryScroller({ data }: StoryScrollerProps) {
  const steps = STORY_FRAMES.map((frame) => ({
    id: frame.id,
    content: (
      <article>
        <span className="step-eyebrow">{frame.actLabel}</span>
        <h3>{frame.captionTitle}</h3>
        {frame.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
    ),
  }));

  return (
    <ScrollStage
      ariaLabel="LTIS three-act narrative"
      steps={steps}
      renderStage={(activeStep) => {
        const safeIndex = Math.max(0, Math.min(activeStep, STORY_FRAMES.length - 1));
        return <StoryStage data={data} frame={STORY_FRAMES[safeIndex]} />;
      }}
    />
  );
}
