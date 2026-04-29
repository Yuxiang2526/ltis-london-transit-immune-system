import { useEffect, useRef, useState } from "react";

interface UseCountUpResult<T extends Element = HTMLDivElement> {
  value: number;
  ref: React.RefObject<T>;
}

/**
 * Counts from 0 to `target` once the element scrolls into view, using
 * `requestAnimationFrame` and a cubic ease-out. Honours
 * `prefers-reduced-motion`: jumps straight to the target value.
 *
 * Adapted from the count-up pattern in the reference EV project.
 */
export function useCountUp<T extends Element = HTMLDivElement>(
  target: number,
  decimals = 1,
  duration = 1400,
): UseCountUpResult<T> {
  const [value, setValue] = useState(0);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const next = +(target * eased).toFixed(decimals);
          setValue(next);
          if (t < 1) requestAnimationFrame(tick);
          else setValue(target);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, decimals, duration]);

  return { value, ref: ref as React.RefObject<T> };
}
