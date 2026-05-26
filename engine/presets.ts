/**
 * Các kịch bản preset minh họa logic tài liệu phân tích.
 *
 * - "golden90s": chu kỳ vàng 1993-2022, tăng giá 8-12%/năm.
 * - "synergy3B": ví dụ căn 3 tỷ, 5 năm, ROI 100% trên vốn thực.
 * - "stress2025": bối cảnh 2025 với yield 2.2%, dòng tiền âm sâu.
 */

import type { ScenarioInput } from "./types";

export const PRESETS: Record<string, { label: string; input: ScenarioInput }> = {
  golden90s: {
    label: "Chu kỳ vàng (2010-2022): căn 1 tỷ, 30% equity",
    input: {
      property: { price: 1_000_000_000, segment: "midCondo" },
      loan: { equityRatio: 0.3, interestRate: 0.1, termYears: 20 },
      rental: {
        monthlyRent: 6_000_000,
        operatingExpenseRatio: 0.15,
        vacancyRate: 0.05,
      },
      market: {
        appreciationRate: 0.12,
        rentGrowthRate: 0.05,
        savingsRate: 0.07,
        householdAnnualIncome: 240_000_000,
      },
      holdingYears: 10,
    },
  },
  synergy3B: {
    label: "Cộng tác đòn bẩy + thuê: căn hộ 3 tỷ, 5 năm",
    input: {
      property: { price: 3_000_000_000, segment: "midCondo" },
      loan: { equityRatio: 0.3, interestRate: 0.09, termYears: 20 },
      rental: {
        monthlyRent: 14_000_000,
        operatingExpenseRatio: 0.1,
        vacancyRate: 0.05,
      },
      market: {
        appreciationRate: 0.07,
        rentGrowthRate: 0.04,
        savingsRate: 0.055,
        householdAnnualIncome: 360_000_000,
      },
      holdingYears: 5,
    },
  },
  stress2025: {
    label: "Bối cảnh 2025: căn 4 tỷ, yield 2.2%, dòng tiền âm",
    input: {
      property: { price: 4_000_000_000, segment: "luxuryCondo" },
      loan: { equityRatio: 0.3, interestRate: 0.095, termYears: 20 },
      rental: {
        monthlyRent: 7_500_000,
        operatingExpenseRatio: 0.15,
        vacancyRate: 0.08,
      },
      market: {
        appreciationRate: 0.04,
        rentGrowthRate: 0.02,
        savingsRate: 0.055,
        householdAnnualIncome: 360_000_000,
      },
      holdingYears: 5,
    },
  },
};

export type PresetKey = keyof typeof PRESETS;
