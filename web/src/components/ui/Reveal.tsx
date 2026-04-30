import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Lightweight scroll-reveal wrapper. IntersectionObserver flips a CSS class
 * once the element enters the viewport; the rest is plain CSS transition.
 *
 * Honours `prefers-reduced-motion`: visible immediately when reduced motion
 * is requested.
 *
 * `will-change: transform` is dropped after the reveal animation completes —
 * keeping it forever pins a GPU compositor layer per Reveal element and
 * silently creates a stacking context that interferes with `position: sticky`
 * descendants. We only need the optimisation for the brief animation window.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      setAnimationFinished(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || animationFinished) return;
    const totalMs = (delay + duration + 0.05) * 1000;
    const t = window.setTimeout(() => setAnimationFinished(true), totalMs);
    return () => window.clearTimeout(t);
  }, [visible, animationFinished, delay, duration]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : `translateY(${y}px)`,
    transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
    // Drop will-change once the animation has finished so we don't keep a
    // permanent GPU layer (and stacking context) on every Reveal in the page.
    willChange: animationFinished ? "auto" : "opacity, transform",
  };

  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
