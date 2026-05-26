import { describe, it, expect } from "vitest";
import { sweep } from "./sensitivity";
import { PRESETS } from "./presets";

describe("sensitivity sweep", () => {
  it("ROI giảm khi lãi vay tăng (synergy3B)", () => {
    const c = sweep(PRESETS.synergy3B.input, "interestRate");
    const first = c.points[0].roiOnTotalCapital;
    const last = c.points[c.points.length - 1].roiOnTotalCapital;
    expect(first).toBeGreaterThan(last);
  });

  it("ROI tăng khi tăng giá tài sản tăng (golden90s)", () => {
    const c = sweep(PRESETS.golden90s.input, "appreciationRate");
    const first = c.points[0].roiOnTotalCapital;
    const last = c.points[c.points.length - 1].roiOnTotalCapital;
    expect(last).toBeGreaterThan(first);
  });

  it("currentX khớp với scenario gốc", () => {
    const base = PRESETS.synergy3B.input;
    const c = sweep(base, "vacancyRate");
    expect(c.currentX).toBeCloseTo(base.rental.vacancyRate, 5);
  });

  it("breakevenX hợp lý cho tăng giá (golden90s)", () => {
    // Khi appreciationRate đủ thấp, ROI/total capital sẽ âm.
    // Khi đủ cao sẽ dương => phải có breakeven trong khoảng quét.
    const c = sweep(PRESETS.golden90s.input, "appreciationRate");
    expect(c.breakevenX).not.toBeNull();
    // Breakeven phải nằm trong dải min..max
    expect(c.breakevenX!).toBeGreaterThanOrEqual(-0.02);
    expect(c.breakevenX!).toBeLessThanOrEqual(0.18);
  });
});
