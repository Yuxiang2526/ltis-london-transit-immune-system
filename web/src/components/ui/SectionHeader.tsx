import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
}

/**
 * Standard editorial section header — eyebrow + title + lede.
 * Visually anchors every major section so the page reads like a long-form
 * magazine article rather than a dashboard pile.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={`section-header section-header--${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-header__title">{title}</h2>
      {description ? (
        <p className="section-header__description">{description}</p>
      ) : null}
    </div>
  );
}
