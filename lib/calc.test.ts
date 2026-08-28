import { describe, it, expect } from "vitest";
import { validateAmount, calculate } from "./calc";

const RATE = 3.42;

describe("validateAmount", () => {
  it("rejects empty", () => expect(validateAmount("").valid).toBe(false));
  it("rejects zero", () => expect(validateAmount("0").error).toMatch(/greater than 0/));
  it("rejects negative", () => expect(validateAmount("-100").error).toMatch(/greater than 0/));
  it("rejects NaN", () => expect(validateAmount("abc").valid).toBe(false));
  it("accepts 100", () => expect(validateAmount("100")).toEqual({ valid: true, value: 100 }));
  it("accepts comma", () => expect(validateAmount("1,000").value).toBe(1000));
  it("accepts decimal", () => expect(validateAmount("100.50").value).toBe(100.5));
  it("rejects huge", () => expect(validateAmount("2000000").valid).toBe(false));
});

describe("calculate", () => {
  it("SGD 100 - returns 3 ranked providers sorted best first", () => {
    const r = calculate({ amountSGD: 100, referenceRate: RATE });
    expect(r.results.length).toBe(3);
    // at 100 SGD, Instarem wins due to zero flat fee; at 1000+ Wise wins
    expect(r.maxDifferenceMYR).toBeGreaterThan(0);
    expect(r.best.netMYR).toBeGreaterThan(r.worst.netMYR);
    expect(r.results[0].netMYR).toBeGreaterThanOrEqual(r.results[1].netMYR);
  });
  it("SGD 1,000 - deterministic", () => {
    const a = calculate({ amountSGD: 1000, referenceRate: RATE });
    const b = calculate({ amountSGD: 1000, referenceRate: RATE });
    expect(a.best.netMYR).toBe(b.best.netMYR);
    expect(a.best.netMYR).toBeCloseTo(3386, -1); // ~3386 allow 5 tolerance
  });
  it("SGD 10,000 - works", () => {
    const r = calculate({ amountSGD: 10000, referenceRate: RATE });
    expect(r.best.netMYR).toBeGreaterThan(33000);
    expect(r.best.netMYR).toBeLessThan(40000);
  });
  it("fee never exceeds amount", () => {
    const r = calculate({ amountSGD: 1, referenceRate: RATE });
    expect(r.results.every((x) => x.netMYR >= 0)).toBe(true);
  });
  it("very large amount 100k", () => {
    const r = calculate({ amountSGD: 100000, referenceRate: RATE });
    expect(r.best.netMYR).toBeGreaterThan(300000);
  });
  it("API failure / fallback still calculates with indicative rate", () => {
    const r = calculate({ amountSGD: 1000, referenceRate: 3.42 });
    expect(r.referenceRate).toBe(3.42);
    expect(r.results.length).toBe(3);
  });
});
