// Human-readable record codes such as ASR-2026-004, PEL-012 or CAP-007.

const pad = (n: number) => String(n).padStart(3, "0");

/** Next sequence number after the highest one found at the end of `codes`. */
export function nextSequence(codes: string[]): number {
  const highest = codes.reduce((max, code) => Math.max(max, Number(code.split("-").pop()) || 0), 0);
  return highest + 1;
}

/** Builds the next code for a prefix, e.g. nextCode("PEL", ["PEL-001"]) → "PEL-002". */
export function nextCode(prefix: string, existing: string[]): string {
  return `${prefix}-${pad(nextSequence(existing))}`;
}

/** Reports restart their numbering each year and per type: ASR-2026-001, MOR-2026-001. */
export function nextReportCode(
  type: string,
  date: string,
  reports: { type: string; date: string; code: string }[],
): string {
  const year = date.slice(0, 4);
  const sameSeries = reports.filter((r) => r.type === type && r.date.startsWith(year));
  return nextCode(
    `${type}-${year}`,
    sameSeries.map((r) => r.code),
  );
}
