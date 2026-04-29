export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "\u00e2\u20ac\u201d";
  }

  return value.toFixed(2);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "\u00e2\u20ac\u201d";
  }

  return `${Math.round(value * 100)}%`;
}

export function formatPopulation(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "\u00e2\u20ac\u201d";
  }

  return Math.round(value).toLocaleString("en-GB");
}
