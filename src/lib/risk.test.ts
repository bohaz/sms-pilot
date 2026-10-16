import { describe, expect, it } from "vitest";
import { PROBABILITIES, SEVERITIES, tolerability } from "./risk";

describe("tolerability (ICAO Doc 9859 matrix)", () => {
  it.each([
    [5, "A", "Intolerable"],
    [4, "B", "Intolerable"],
    [3, "A", "Intolerable"],
    [3, "C", "Tolerable"],
    [5, "E", "Tolerable"],
    [1, "A", "Tolerable"],
    [3, "E", "Aceptable"],
    [2, "D", "Aceptable"],
    [1, "E", "Aceptable"],
  ] as const)("%s%s is %s", (p, s, expected) => {
    expect(tolerability(p, s)).toBe(expected);
  });

  it("classifies all 25 cells: 6 intolerable, 7 acceptable, 12 tolerable", () => {
    const counts = { Intolerable: 0, Tolerable: 0, Aceptable: 0 };
    for (const { v: p } of PROBABILITIES) {
      for (const { v: s } of SEVERITIES) counts[tolerability(p, s)]++;
    }
    expect(counts).toEqual({ Intolerable: 6, Tolerable: 12, Aceptable: 7 });
  });
});
