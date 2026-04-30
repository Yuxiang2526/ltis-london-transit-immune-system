/**
 * Display formatters. The fallback for null / undefined / NaN is the
 * em-dash "—" (U+2014), used consistently across all metric panels.
 */

const NA = "—"; // em dash

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NA;
  }
  return value.toFixed(2);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NA;
  }
  return `${Math.round(value * 100)}%`;
}

export function formatPopulation(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NA;
  }
  return Math.round(value).toLocaleString("en-GB");
}
