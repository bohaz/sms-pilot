import { describe, expect, it } from "vitest";
import { nextCode, nextReportCode, nextSequence } from "./codes";

describe("nextSequence", () => {
  it("starts at 1", () => {
    expect(nextSequence([])).toBe(1);
  });

  it("continues after the highest number, even with gaps", () => {
    expect(nextSequence(["CAP-001", "CAP-007", "CAP-003"])).toBe(8);
  });
});

describe("nextCode", () => {
  it("pads to three digits", () => {
    expect(nextCode("PEL", ["PEL-009"])).toBe("PEL-010");
  });
});

describe("nextReportCode", () => {
  const reports = [
    { type: "ASR", date: "2026-02-01", code: "ASR-2026-001" },
    { type: "ASR", date: "2026-05-10", code: "ASR-2026-002" },
    { type: "MOR", date: "2026-05-11", code: "MOR-2026-001" },
    { type: "ASR", date: "2025-12-30", code: "ASR-2025-014" },
  ];

  it("numbers each type separately within the year", () => {
    expect(nextReportCode("ASR", "2026-09-01", reports)).toBe("ASR-2026-003");
    expect(nextReportCode("MOR", "2026-09-01", reports)).toBe("MOR-2026-002");
  });

  it("restarts the numbering in a new year", () => {
    expect(nextReportCode("ASR", "2027-01-02", reports)).toBe("ASR-2027-001");
  });

  it("uses the event date, not the current year", () => {
    expect(nextReportCode("ASR", "2025-12-31", reports)).toBe("ASR-2025-015");
  });
});
