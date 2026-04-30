import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  /** Optional 2-char number badge — e.g. "01", "II". Adds visual rhythm. */
  badge?: string;
  /** Tone steers the badge / accent rule colour. */
  tone?: "cool" | "warm" | "accent";
}

/**
 * Editorial section header — eyebrow + title + lede, with an optional
 * numbered badge at the left and a coloured vertical rule. Anchors every
 * major section so the page reads like a long-form magazine article
 * rather than a dashboard pile.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  badge,
  tone = "accent",
}: SectionHeaderProps) {
  return (
    <div
      className={`section-header section-header--${align} section-header--${tone}${badge ? " section-header--with-badge" : ""}`}
    >
      {badge ? (
        <span className="section-header__badge num-mono" aria-hidden="true">
          {badge}
        </span>
      ) : null}
      <div className="section-header__inner">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-header__title">{title}</h2>
        {description ? (
          <p className="section-header__description">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
