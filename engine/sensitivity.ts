/**
 * Sensitivity analysis: chạy lại simulator nhiều lần với 1 biến trượt
 * để thấy ảnh hưởng tới ROI và các chỉ số khác.
 *
 * Có thể tổng quát hoá để sweep nhiều biến (2D heatmap), nhưng phase 1
 * chỉ cần 1D line chart là đủ trực quan.
 */

import { simulate } from "./simulator";
import type { ScenarioInput, ScenarioResult } from "./types";

export type SensitivityVariable =
  | "interestRate"
  | "appreciationRate"
  | "vacancyRate"
  | "equityRatio"
  | "rentGrowthRate"
  | "holdingYears";

export interface VariableConfig {
  key: SensitivityVariable;
  label: string;
  /** Đơn vị hiển thị (%, năm) */
  unit: "percent" | "years";
  /** Min, max, step áp dụng cho input thô (vd. 0.05..0.15 cho rate, 1..30 cho năm) */
  min: number;
  max: number;
  step: number;
  /** Helper: tạo scenario mới với giá trị x cho biến này */
  apply: (base: ScenarioInput, value: number) => ScenarioInput;
  /** Helper: lấy giá trị hiện tại từ scenario (để đánh dấu vị trí "current" trên chart) */
  current: (s: ScenarioInput) => number;
}

export const VARIABLE_CONFIGS: Record<SensitivityVariable, VariableConfig> = {
  interestRate: {
    key: "interestRate",
    label: "Lãi suất vay",
    unit: "percent",
    min: 0.04,
    max: 0.16,
    step: 0.005,
    apply: (b, v) => ({ ...b, loan: { ...b.loan, interestRate: v } }),
    current: (s) => s.loan.interestRate,
  },
  appreciationRate: {
    key: "appreciationRate",
    label: "Tốc độ tăng giá tài sản",
    unit: "percent",
    min: -0.02,
    max: 0.18,
    step: 0.005,
    apply: (b, v) => ({ ...b, market: { ...b.market, appreciationRate: v } }),
    current: (s) => s.market.appreciationRate,
  },
  vacancyRate: {
    key: "vacancyRate",
    label: "Tỷ lệ trống nhà",
    unit: "percent",
    min: 0,
    max: 0.5,
    step: 0.01,
    apply: (b, v) => ({ ...b, rental: { ...b.rental, vacancyRate: v } }),
    current: (s) => s.rental.vacancyRate,
  },
  equityRatio: {
    key: "equityRatio",
    label: "Tỷ lệ vốn tự có",
    unit: "percent",
    min: 0.1,
    max: 1,
    step: 0.05,
    apply: (b, v) => ({ ...b, loan: { ...b.loan, equityRatio: v } }),
    current: (s) => s.loan.equityRatio,
  },
  rentGrowthRate: {
    key: "rentGrowthRate",
    label: "Tăng tiền thuê",
    unit: "percent",
    min: 0,
    max: 0.1,
    step: 0.005,
    apply: (b, v) => ({ ...b, market: { ...b.market, rentGrowthRate: v } }),
    current: (s) => s.market.rentGrowthRate,
  },
  holdingYears: {
    key: "holdingYears",
    label: "Thời gian nắm giữ",
    unit: "years",
    min: 1,
    max: 25,
    step: 1,
    apply: (b, v) => ({ ...b, holdingYears: v }),
    current: (s) => s.holdingYears,
  },
};

export interface SensitivityPoint {
  x: number;
  roiOnInitialEquity: number;
  roiOnTotalCapital: number;
  cagr: number;
  netCashFlowYear1: number;
  /** Toàn bộ kết quả - tiện cho tooltip nâng cao nếu cần */
  result: ScenarioResult;
}

export interface SensitivityCurve {
  variable: SensitivityVariable;
  points: SensitivityPoint[];
  /** Giá trị hiện tại trên scenario gốc - để đánh dấu marker */
  currentX: number;
  /** Giao điểm với 0 (breakeven) trên ROI/total capital, nếu có */
  breakevenX: number | null;
}

/**
 * Quét 1 biến từ min..max với step cố định, trả về curve ROI.
 *
 * Lưu ý: simulate() là hàm thuần, chi phí thấp. Số điểm thường < 100
 * nên chạy đồng bộ trong useMemo của React không vấn đề gì.
 */
export function sweep(
  base: ScenarioInput,
  variable: SensitivityVariable,
): SensitivityCurve {
  const cfg = VARIABLE_CONFIGS[variable];
  const points: SensitivityPoint[] = [];

  // Tránh sai số floating: dùng index nguyên rồi nhân step
  const stepCount = Math.round((cfg.max - cfg.min) / cfg.step);
  for (let i = 0; i <= stepCount; i++) {
    const raw = cfg.min + i * cfg.step;
    // Chống đụng floating: làm tròn về step gần nhất
    const x = Math.round(raw / cfg.step) * cfg.step;
    const scenario = cfg.apply(base, x);
    const result = simulate(scenario);
    points.push({
      x,
      roiOnInitialEquity: result.exit.roiOnInitialEquity,
      roiOnTotalCapital: result.exit.roiOnTotalCapital,
      cagr: result.exit.cagrOnTotalCapital,
      netCashFlowYear1: result.yearly[0]?.netCashFlow ?? 0,
      result,
    });
  }

  return {
    variable,
    points,
    currentX: cfg.current(base),
    breakevenX: findBreakeven(points),
  };
}

/**
 * Tìm điểm ROI/total capital giao 0 bằng nội suy tuyến tính.
 * Trả về null nếu curve không cắt 0 trong khoảng quét.
 */
function findBreakeven(points: SensitivityPoint[]): number | null {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const ya = a.roiOnTotalCapital;
    const yb = b.roiOnTotalCapital;
    if ((ya <= 0 && yb >= 0) || (ya >= 0 && yb <= 0)) {
      if (ya === yb) return a.x;
      const t = (0 - ya) / (yb - ya);
      return a.x + t * (b.x - a.x);
    }
  }
  return null;
}
