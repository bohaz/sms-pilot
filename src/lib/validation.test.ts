import { describe, expect, it } from "vitest";
import { validateAction, validateClosure, validateReport, validateTitle } from "./validation";

const TODAY = "2026-10-15";

describe("validateReport", () => {
  const description = "Impacto con ave durante el despegue.";

  it("accepts a complete report", () => {
    expect(validateReport({ description, date: TODAY }, TODAY)).toBeNull();
  });

  it("requires a meaningful description, ignoring spaces", () => {
    expect(validateReport({ description: "   corto    ", date: TODAY }, TODAY)).toMatch(/15/);
  });

  it("rejects future dates", () => {
    expect(validateReport({ description, date: "2026-10-16" }, TODAY)).toMatch(/futura/);
  });
});

describe("validateTitle", () => {
  it("requires at least five characters", () => {
    expect(validateTitle("Fauna")).toBeNull();
    expect(validateTitle(" Ave ")).toMatch(/5/);
  });
});

describe("validateAction", () => {
  it("accepts a due date of today", () => {
    expect(validateAction({ title: "Auditar herramientas", dueDate: TODAY }, TODAY)).toBeNull();
  });

  it("rejects a due date in the past", () => {
    expect(validateAction({ title: "Auditar herramientas", dueDate: "2026-10-14" }, TODAY)).toMatch(
      /pasado/,
    );
  });

  it("checks the title first", () => {
    expect(validateAction({ title: "x", dueDate: "2000-01-01" }, TODAY)).toMatch(/título/);
  });
});

describe("validateClosure", () => {
  it("requires evidence to close an action", () => {
    expect(validateClosure("Hecho")).toMatch(/evidencia/);
    expect(validateClosure("Procedimiento emitido y verificado.")).toBeNull();
  });
});
