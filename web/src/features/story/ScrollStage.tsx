import type { ReactNode } from "react";
import { useScrollStage } from "./useScrollStage";
import "./ScrollStage.css";

export interface ScrollStep {
  /** Stable id used by the parent to switch the sticky stage. */
  id: string;
  /** Editorial text rendered into the scrolling column. MDX-friendly. */
  content: ReactNode;
}

interface ScrollStageProps {
  /** Sticky visual rendered on the left, told what to show by `activeStep`. */
  renderStage: (activeStep: number) => ReactNode;
  /** Ordered narrative steps shown in the right scrolling column. */
  steps: ScrollStep[];
  /** Optional className applied to the section root. */
  className?: string;
  /** Heading shown above the steps (visually hidden but read by screen readers). */
  ariaLabel?: string;
}

/**
 * Two-column scrollytelling layout:
 *
 *   ┌──────────────┬──────────────┐
 *   │              │   step 0     │
 *   │   sticky     │              │
 *   │   stage      │   step 1     │
 *   │  (visual)    │              │
 *   │              │   step 2     │
 *   └──────────────┴──────────────┘
 *
 * The sticky stage receives the active step index and decides what to render —
 * a map state, an annotation overlay, an animated chart frame, etc.
 */
export default function ScrollStage({
  renderStage,
  steps,
  className,
  ariaLabel = "Scrolling narrative",
}: ScrollStageProps) {
  const { activeStep, containerRef } = useScrollStage({ stepSelector: ".scroll-step" });

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className={`scroll-stage ${className ?? ""}`}
      aria-label={ariaLabel}
    >
      <div className="scroll-stage-sticky" aria-hidden="true">
        {renderStage(activeStep)}
      </div>

      <ol className="scroll-stage-steps">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="scroll-step"
            data-step-id={step.id}
            data-active={activeStep === index || undefined}
          >
            {step.content}
          </li>
        ))}
      </ol>
    </section>
  );
}
