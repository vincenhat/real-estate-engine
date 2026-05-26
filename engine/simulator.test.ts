import { describe, it, expect } from "vitest";
import { simulate } from "./simulator";
import { PRESETS } from "./presets";

describe("simulator - golden cycle preset", () => {
  it("tạo lợi nhuận đáng kể nhờ đòn bẩy + tăng giá nhanh", () => {
    const r = simulate(PRESETS.golden90s.input);
    // 1 tỷ, equity 300tr, tăng giá 12%/năm trong 10 năm => giá ~3.1 tỷ
    expect(r.exit.netAssetAtExit).toBeGreaterThan(2_000_000_000);
    // ROI trên equity ban đầu phải > 5x trong điều kiện này
    expect(r.exit.roiOnInitialEquity).toBeGreaterThan(5);
    expect(r.risk.spreadLevel).toBe("safe");
  });
});

describe("simulator - 2025 stress preset", () => {
  it("phát cảnh báo dòng tiền âm và yield thấp", () => {
    const r = simulate(PRESETS.stress2025.input);
    expect(r.risk.warnings.length).toBeGreaterThan(0);
    expect(r.risk.beatsSavingsRate).toBe(false);
    // Dòng tiền âm năm 1
    expect(r.yearly[0].netCashFlow).toBeLessThan(0);
    // Phải có cash injection được cộng dồn
    expect(r.exit.totalCashInjection).toBeGreaterThan(0);
  });
});

describe("simulator - mathematical invariants", () => {
  it("netAsset = propertyValue - outstandingPrincipal", () => {
    const r = simulate(PRESETS.synergy3B.input);
    for (const y of r.yearly) {
      expect(y.netAsset).toBeCloseTo(y.propertyValue - y.outstandingPrincipal, 0);
    }
  });

  it("totalCapitalDeployed = initialEquity + totalCashInjection", () => {
    const r = simulate(PRESETS.synergy3B.input);
    expect(r.exit.totalCapitalDeployed).toBeCloseTo(
      r.exit.initialEquity + r.exit.totalCashInjection,
      0,
    );
  });
});
