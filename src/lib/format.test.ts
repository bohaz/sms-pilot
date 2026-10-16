import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addDays,
  addMonths,
  daysBetween,
  daysUntil,
  fmtDate,
  fmtDateTime,
  monthLabel,
  toCsv,
  toDateKey,
  today,
} from "./format";

afterEach(() => {
  vi.useRealTimers();
});

// Tests run with TZ=America/Caracas (UTC-4), see vitest.config.mts.
describe("dates in local time", () => {
  it("today() is the local date, not the UTC one", () => {
    // 21:30 in Caracas on 15 Oct is already 16 Oct in UTC.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-16T01:30:00Z"));

    expect(today()).toBe("2026-10-15");
  });

  it("toDateKey pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("fmtDateTime shows the local date with the local time", () => {
    expect(fmtDateTime("2026-10-16T01:30:00.000Z")).toBe("15 oct 2026 21:30");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds months across year boundaries", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });

  it("counts days between dates and until a due date", () => {
    expect(daysBetween("2026-09-29", "2026-10-09")).toBe(10);
    expect(daysUntil("2026-10-20", "2026-10-15")).toBe(5);
    expect(daysUntil("2026-10-10", "2026-10-15")).toBe(-5);
  });
});

describe("labels", () => {
  it("formats dates and months in Spanish", () => {
    expect(fmtDate("2026-03-07")).toBe("07 mar 2026");
    expect(fmtDate(undefined)).toBe("");
    expect(monthLabel("2026-12")).toBe("dic 2026");
  });
});

describe("toCsv", () => {
  it("starts with a BOM so Excel reads accents correctly", () => {
    expect(toCsv([["á"]]).startsWith("﻿")).toBe(true);
  });

  it("quotes values with commas, quotes, semicolons or line breaks", () => {
    const csv = toCsv([["a,b", 'dijo "hola"', "x;y", "línea\nnueva", 3, null]]);
    expect(csv.slice(1)).toBe('"a,b","dijo ""hola""","x;y","línea\nnueva",3,');
  });
});
