import { describe, expect, it } from "vitest";
import { buildSpiRows, semAsr, semFat, semInc, semRate } from "./spi";
import type { Report } from "./types";

const report = (type: "ASR" | "MOR", date: string) => ({ type, date }) as Report;

describe("semaphore criteria", () => {
  it("incidents: 0 green, 1 yellow, 2+ red", () => {
    expect([semInc(0), semInc(1), semInc(2), semInc(5)]).toEqual([
      "VERDE",
      "AMARILLO",
      "ROJO",
      "ROJO",
    ]);
  });

  it("reporting culture: 2+ green, 1 yellow, 0 red", () => {
    expect([semAsr(3), semAsr(2), semAsr(1), semAsr(0)]).toEqual([
      "VERDE",
      "VERDE",
      "AMARILLO",
      "ROJO",
    ]);
  });

  it("fatigue: any exceedance is red", () => {
    expect([semFat(0), semFat(1)]).toEqual(["VERDE", "ROJO"]);
  });

  it("incident rate: 0 green, up to 2 % yellow, above red", () => {
    expect([semRate(0), semRate(2), semRate(2.01)]).toEqual(["VERDE", "AMARILLO", "ROJO"]);
  });
});

describe("buildSpiRows", () => {
  const reports = [
    report("ASR", "2026-08-03"),
    report("ASR", "2026-08-20"),
    report("MOR", "2026-08-21"),
    report("ASR", "2026-09-02"),
  ];

  it("counts reports per month and computes the rate", () => {
    const [aug] = buildSpiRows([{ month: "2026-08", flights: 50, fatigue: 0 }], reports);

    expect(aug).toMatchObject({ asr: 2, mor: 1, rate: 2, semInc: "AMARILLO", semRate: "AMARILLO" });
  });

  it("sorts months chronologically", () => {
    const rows = buildSpiRows(
      [
        { month: "2026-09", flights: 40, fatigue: 0 },
        { month: "2026-08", flights: 50, fatigue: 0 },
      ],
      reports,
    );
    expect(rows.map((r) => r.month)).toEqual(["2026-08", "2026-09"]);
  });

  it("leaves semaphores empty for a month without flights", () => {
    const [row] = buildSpiRows([{ month: "2026-10", flights: 0, fatigue: null }], reports);

    expect(row.rate).toBeNull();
    expect([row.semInc, row.semAsr, row.semFat, row.semRate]).toEqual([null, null, null, null]);
  });

  it("leaves the fatigue semaphore empty when there is no fatigue data", () => {
    const [row] = buildSpiRows([{ month: "2026-08", flights: 50, fatigue: null }], reports);
    expect(row.semFat).toBeNull();
    expect(row.semInc).toBe("AMARILLO");
  });
});
