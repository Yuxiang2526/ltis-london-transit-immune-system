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
 *
 * Each step content now carries a `data-tone` so the caption box can pick up
 * a cool / warm accent rule that matches the choropleth on the left.
 */
export default function StoryScroller({ data }: StoryScrollerProps) {
  const steps = STORY_FRAMES.map((frame, idx) => ({
    id: frame.id,
    content: (
      <article className={`scroll-step__inner scroll-step__inner--${frame.tone}`}>
        <header className="scroll-step__head">
          <span className="scroll-step__act-num num-mono">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <span className="step-eyebrow">{frame.actLabel}</span>
        </header>
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
