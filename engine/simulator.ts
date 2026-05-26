/**
 * Lõi mô phỏng đầu tư bất động sản theo logic tài liệu phân tích VN.
 *
 * Quy trình:
 *  1. Khởi tạo khoản vay (amortize).
 *  2. Mỗi năm trong holding period:
 *     - Tài sản tăng giá theo appreciationRate.
 *     - Tiền thuê tăng theo rentGrowthRate, trừ vacancy & opex.
 *     - Trừ debt service.
 *     - Tính dòng tiền ròng (có thể âm => "bù dòng tiền").
 *  3. Tại exit: net asset = giá trị tài sản - dư nợ còn lại.
 *  4. ROI tính trên cả vốn gốc và tổng vốn thực (đã cộng tiền bù).
 */

import { amortize } from "./loan";
import { SEGMENT_BENCHMARKS } from "./benchmarks";
import type {
  ScenarioInput,
  ScenarioResult,
  YearlyProjection,
  ExitMetrics,
  YieldMetrics,
  RiskAssessment,
  RiskLevel,
} from "./types";

export function simulate(input: ScenarioInput): ScenarioResult {
  const { property, loan, rental, market, holdingYears } = input;

  const initialEquity = property.price * loan.equityRatio;
  const principal = property.price - initialEquity;

  const schedule = amortize(principal, loan.interestRate, loan.termYears);
  const monthlyDebtService = schedule.monthlyPayment;

  const yearly: YearlyProjection[] = [];
  let totalCashInjection = 0;

  for (let year = 1; year <= holdingYears; year++) {
    const propertyValue =
      property.price * Math.pow(1 + market.appreciationRate, year);

    // Tiền thuê năm đó (đã trừ trống nhà)
    const baseMonthlyRent =
      rental.monthlyRent * Math.pow(1 + market.rentGrowthRate, year - 1);
    const grossRentYear = baseMonthlyRent * 12;
    const rentCollected = grossRentYear * (1 - rental.vacancyRate);
    const operatingExpense = rentCollected * rental.operatingExpenseRatio;

    // Debt service: nếu năm hiện tại vẫn trong kỳ vay thì = paidByYear,
    // nếu đã trả hết (holdingYears > termYears) thì = 0.
    const debtServicePaid =
      year <= loan.termYears ? schedule.paidByYear[year - 1] : 0;
    const outstandingPrincipal =
      year <= loan.termYears ? schedule.balanceByYear[year - 1] : 0;

    const netCashFlow = rentCollected - operatingExpense - debtServicePaid;

    if (netCashFlow < 0) {
      totalCashInjection += -netCashFlow;
    }

    const netAsset = propertyValue - outstandingPrincipal;

    yearly.push({
      year,
      propertyValue,
      outstandingPrincipal,
      debtServicePaid,
      rentCollected,
      operatingExpense,
      netCashFlow,
      netAsset,
    });
  }

  const last = yearly[yearly.length - 1];
  const totalCapitalDeployed = initialEquity + totalCashInjection;
  const netAssetAtExit = last.netAsset;
  const netProfit = netAssetAtExit - totalCapitalDeployed;

  const exit: ExitMetrics = {
    initialEquity,
    totalCashInjection,
    totalCapitalDeployed,
    netAssetAtExit,
    netProfit,
    roiOnTotalCapital: netProfit / totalCapitalDeployed,
    roiOnInitialEquity: (netAssetAtExit - initialEquity) / initialEquity,
    cagrOnTotalCapital:
      Math.pow(netAssetAtExit / totalCapitalDeployed, 1 / holdingYears) - 1,
  };

  const yields = computeYields(input, monthlyDebtService);
  const risk = assessRisk(input, monthlyDebtService, yields, exit);

  // Cộng monthlyDebtService vào yearly[0] (no-op, để giữ closure đầy đủ data nếu cần debug)
  void monthlyDebtService;

  return { input, yearly, exit, yields, risk };
}

function computeYields(
  input: ScenarioInput,
  _monthlyDebtService: number,
): YieldMetrics {
  const { property, rental } = input;
  const annualGrossRent = rental.monthlyRent * 12;
  const grossYield = annualGrossRent / property.price;

  const effectiveRent = annualGrossRent * (1 - rental.vacancyRate);
  const opex = effectiveRent * rental.operatingExpenseRatio;
  const netYield = (effectiveRent - opex) / property.price;

  const benchmark = SEGMENT_BENCHMARKS[property.segment];

  return {
    grossYield,
    netYield,
    segmentBenchmark: {
      grossLow: benchmark.grossLow,
      grossHigh: benchmark.grossHigh,
      netLow: benchmark.netLow,
      netHigh: benchmark.netHigh,
    },
  };
}

function assessRisk(
  input: ScenarioInput,
  monthlyDebtService: number,
  yields: YieldMetrics,
  _exit: ExitMetrics,
): RiskAssessment {
  const { rental, market, loan, property } = input;

  // 1. Debt coverage: tiền thuê thuần / khoản trả góp tháng 1
  const monthlyNetRent =
    rental.monthlyRent *
    (1 - rental.vacancyRate) *
    (1 - rental.operatingExpenseRatio);
  const dcr = monthlyDebtService === 0 ? Infinity : monthlyNetRent / monthlyDebtService;

  let dcrLevel: RiskLevel;
  if (dcr >= 0.8) dcrLevel = "safe";
  else if (dcr >= 0.5) dcrLevel = "warning";
  else dcrLevel = "danger";

  // 2. Spread: tăng giá vs lãi vay (ε nhỏ để tránh sai số floating point)
  const spread = market.appreciationRate - loan.interestRate;
  const EPS = 1e-9;
  let spreadLevel: RiskLevel;
  if (spread >= 0.02 - EPS) spreadLevel = "safe";
  else if (spread >= -0.01 - EPS) spreadLevel = "warning";
  else spreadLevel = "danger";

  // 3. Price/Income ratio
  const piRatio =
    market.householdAnnualIncome > 0
      ? property.price / market.householdAnnualIncome
      : 0;

  // 4. Vacancy stress test: thêm 1, 2, 3 tháng trống/năm
  const vacancyStress = [1, 2, 3].map((vacantMonths) => {
    const lostRent =
      rental.monthlyRent * vacantMonths * (1 - rental.operatingExpenseRatio);
    return { vacantMonths, extraInjection: lostRent };
  });

  // 5. Có vượt lãi tiết kiệm?
  const beatsSavingsRate = yields.netYield > market.savingsRate;

  const warnings: string[] = [];
  if (dcrLevel === "danger") {
    warnings.push(
      `Tiền thuê chỉ khỏa lấp ${(dcr * 100).toFixed(0)}% khoản trả góp - dưới ngưỡng an toàn 50%.`,
    );
  } else if (dcrLevel === "warning") {
    warnings.push(
      `Tỷ lệ khỏa lấp nợ ${(dcr * 100).toFixed(0)}% còn xa ngưỡng tối ưu 80-90%.`,
    );
  }
  if (spreadLevel === "danger") {
    warnings.push(
      `Tốc độ tăng giá (${(market.appreciationRate * 100).toFixed(1)}%) thấp hơn lãi vay (${(loan.interestRate * 100).toFixed(1)}%) - đòn bẩy đang ăn mòn vốn.`,
    );
  }
  if (!beatsSavingsRate) {
    warnings.push(
      `Net yield ${(yields.netYield * 100).toFixed(2)}% thấp hơn lãi tiết kiệm ${(market.savingsRate * 100).toFixed(2)}%.`,
    );
  }
  if (piRatio > 20) {
    warnings.push(
      `P/I = ${piRatio.toFixed(1)} - cao hơn nhiều so với mức trung bình toàn cầu 14.6.`,
    );
  }

  return {
    debtCoverageRatio: dcr,
    debtCoverageLevel: dcrLevel,
    appreciationVsInterestSpread: spread,
    spreadLevel,
    priceToIncomeRatio: piRatio,
    vacancyStress,
    beatsSavingsRate,
    warnings,
  };
}
