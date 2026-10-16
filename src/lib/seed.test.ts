import { describe, expect, it } from "vitest";
import { buildSeed } from "./seed";
import { verifyChain } from "./audit";
import { buildSpiRows } from "./spi";
import { RAV5 } from "./tenant";

const NOW = new Date("2026-09-29T12:00:00Z");
const TODAY = "2026-09-29";
const seed = buildSeed(NOW);

describe("demo data", () => {
  it("has unique report codes", () => {
    const codes = seed.reports.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("has no reports dated in the future", () => {
    expect(seed.reports.filter((r) => r.date > TODAY)).toEqual([]);
  });

  it("lists reports newest first", () => {
    const dates = seed.reports.map((r) => r.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("covers the last nine months of operations", () => {
    expect(seed.ops.map((o) => o.month)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
    ]);
  });

  it("produces semaphores for every month", () => {
    const rows = buildSpiRows(seed.ops, seed.reports);
    expect(rows.every((r) => r.semInc && r.semAsr && r.semRate)).toBe(true);
  });

  it("only links reports to hazards that exist", () => {
    const hazardIds = new Set(seed.hazards.map((h) => h.id));
    const links = seed.reports.flatMap((r) => r.hazardIds);
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((id) => hazardIds.has(id))).toBe(true);
  });

  it("includes closed actions with evidence and overdue ones for the demo", () => {
    const closed = seed.actions.filter((a) => a.status === "Cerrada");
    const overdue = seed.actions.filter((a) => a.status !== "Cerrada" && a.dueDate < TODAY);

    expect(closed.every((a) => a.evidence && a.closedAt)).toBe(true);
    expect(closed).toHaveLength(3);
    expect(overdue).toHaveLength(2);
  });

  it("has a state for each of the 12 RAV 5 elements", () => {
    expect(Object.keys(seed.rav5).sort()).toEqual(RAV5.map((e) => e.id).sort());
  });

  it("starts with a valid audit chain", () => {
    expect(verifyChain(seed.audit).ok).toBe(true);
  });
});
