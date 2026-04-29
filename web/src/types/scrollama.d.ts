/**
 * Minimal local typings for `scrollama`.
 * Upstream package ships no types. We type only the surface we use; expand as
 * new methods get adopted.
 */
declare module "scrollama" {
  export interface ScrollamaStepEvent {
    element: HTMLElement;
    index: number;
    direction: "up" | "down";
  }

  export interface ScrollamaSetupOptions {
    /** CSS selector for the step elements */
    step: string | HTMLElement | NodeListOf<HTMLElement>;
    /** Trigger point (0–1, fraction of viewport from top). Default 0.5. */
    offset?: number;
    /** Adjust step at debounce intervals (ms). */
    debug?: boolean;
    /** Show the trigger guideline (dev only). */
    progress?: boolean;
    /** Threshold (0–1) for IntersectionObserver. */
    threshold?: number;
  }

  export interface ScrollamaInstance {
    setup(options: ScrollamaSetupOptions): ScrollamaInstance;
    onStepEnter(callback: (event: ScrollamaStepEvent) => void): ScrollamaInstance;
    onStepExit(callback: (event: ScrollamaStepEvent) => void): ScrollamaInstance;
    onStepProgress(
      callback: (event: ScrollamaStepEvent & { progress: number }) => void,
    ): ScrollamaInstance;
    resize(): ScrollamaInstance;
    destroy(): void;
  }

  function scrollama(): ScrollamaInstance;

  export default scrollama;
}
