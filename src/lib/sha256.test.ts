import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { sha256 } from "./sha256";

const reference = (s: string) => createHash("sha256").update(s).digest("hex");

describe("sha256", () => {
  it.each([
    ["empty string", ""],
    ["short ASCII", "abc"],
    ["55 bytes, padding fits in one block", "x".repeat(55)],
    ["56 bytes, padding needs a second block", "x".repeat(56)],
    ["exactly one block", "x".repeat(64)],
    ["multi-byte UTF-8 over several blocks", "Aerolínea Demo ñ ✈".repeat(20)],
  ])("matches node:crypto for %s", (_, input) => {
    expect(sha256(input)).toBe(reference(input));
  });

  it("returns 64 lowercase hex characters", () => {
    expect(sha256("Vigía")).toMatch(/^[0-9a-f]{64}$/);
  });
});
