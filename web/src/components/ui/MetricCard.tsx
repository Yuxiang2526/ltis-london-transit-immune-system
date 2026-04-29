import { useCountUp } from "../../hooks/useCountUp";

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  note?: string;
  highlight?: boolean;
  /** Disable count-up — render static value (e.g. when value is non-numeric). */
  staticValue?: string;
}

/**
 * Animated metric card — IO-triggered count-up plus eyebrow label and note.
 * Used in the Hero stats strip and the About hero.
 */
export default function MetricCard({
  label,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  note,
  highlight = false,
  staticValue,
}: MetricCardProps) {
  const { value: animated, ref } = useCountUp<HTMLDivElement>(value, decimals);
  const displayed = staticValue ?? `${prefix}${animated.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`;

  return (
    <div ref={ref} className={`metric-card${highlight ? " metric-card--highlight" : ""}`}>
      <p className="metric-card__label">{label}</p>
      <h3 className="metric-card__value num">{displayed}</h3>
      {note ? <p className="metric-card__note muted">{note}</p> : null}
    </div>
  );
}
