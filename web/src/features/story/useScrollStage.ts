import { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";

interface UseScrollStageOptions {
  /** CSS selector under the container that marks each story step. */
  stepSelector?: string;
  /** Viewport offset (0–1) at which a step counts as "active". */
  offset?: number;
  /** Optional callback fired whenever the active step changes. */
  onStepChange?: (index: number) => void;
}

export interface ScrollStageState {
  /** Index of the currently active step (-1 = before any step). */
  activeStep: number;
  /** Ref to attach to the scrolling container element. */
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Wraps `scrollama` in a React-friendly hook.
 *
 * Usage:
 *   const { activeStep, containerRef } = useScrollStage({ stepSelector: ".step" });
 *   <section ref={containerRef as any}>
 *     <div className="sticky-stage">{renderStage(activeStep)}</div>
 *     <div className="step">…</div>
 *     <div className="step">…</div>
 *   </section>
 */
export function useScrollStage(options: UseScrollStageOptions = {}): ScrollStageState {
  const { stepSelector = ".scroll-step", offset = 0.6, onStepChange } = options;
  const containerRef = useRef<HTMLElement | null>(null);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!containerRef.current) return;
    const steps = containerRef.current.querySelectorAll<HTMLElement>(stepSelector);
    if (steps.length === 0) return;

    const scroller = scrollama();
    scroller
      .setup({ step: steps, offset })
      .onStepEnter((event) => {
        setActiveStep(event.index);
        onStepChange?.(event.index);
      })
      .onStepExit((event) => {
        // Going up past the first step → reset.
        if (event.direction === "up" && event.index === 0) {
          setActiveStep(-1);
        }
      });

    const handleResize = () => scroller.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scroller.destroy();
    };
  }, [stepSelector, offset, onStepChange]);

  return { activeStep, containerRef };
}
