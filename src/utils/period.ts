export function normalizePeriod(input: string): string {
  const trimmed = input.trim();

  // Match "Q2 2025" or "Q2, 2025"
  const qFirst = trimmed.match(/^Q([1-4])[\s,]+(\d{4})$/i);
  if (qFirst) {
    return `${qFirst[2]}-Q${qFirst[1]}`;
  }

  // Match "2025 Q2" or "2025-Q2" or "2025/Q2"
  const yrFirstQ = trimmed.match(/^(\d{4})[-\/\s]*Q([1-4])$/i);
  if (yrFirstQ) {
    return `${yrFirstQ[1]}-Q${yrFirstQ[2]}`;
  }

  // Match Singapore style "20252Q"
  const sgQuarter = trimmed.match(/^(\d{4})([1-4])Q$/i);
  if (sgQuarter) {
    return `${sgQuarter[1]}-Q${sgQuarter[2]}`;
  }

  // Match "2025-06" or "2025-6"
  const monthly = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (monthly) {
    const mm = monthly[2].padStart(2, '0');
    return `${monthly[1]}-${mm}`;
  }

  return trimmed;
}

export function arePeriodsEqual(p1: string, p2: string): boolean {
  return normalizePeriod(p1).toUpperCase() === normalizePeriod(p2).toUpperCase();
}
