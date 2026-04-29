import { useMemo } from "react";
import katex from "katex";

interface MathProps {
  /** TeX source. */
  children: string;
  /** Block (centered, larger) vs inline. */
  display?: boolean;
  /** Optional ARIA label so screen readers get a plain-language reading. */
  ariaLabel?: string;
}

/**
 * KaTeX renderer wrapper. We render to an HTML string at build/render time
 * (no MathML feature required at runtime); the raw string is set via
 * `dangerouslySetInnerHTML` because KaTeX is a trusted dependency and the
 * input is author-controlled TeX, never user input.
 */
export default function Math({ children, display = false, ariaLabel }: MathProps) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        displayMode: display,
        throwOnError: false,
        output: "html",
        strict: "ignore",
      }),
    [children, display],
  );

  return (
    <span
      className={display ? "math math-display" : "math math-inline"}
      role="math"
      aria-label={ariaLabel ?? children}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
