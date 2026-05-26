/**
 * Domain types for the Vietnam real-estate investment engine.
 *
 * Tất cả tiền tệ tính bằng VNĐ (đơn vị: đồng).
 * Tỷ suất tính bằng số thập phân (0.07 = 7%/năm), không phải %.
 */

export type Segment =
  | "midCondo"        // Căn hộ trung cấp
  | "luxuryCondo"     // Căn hộ cao cấp / hạng sang
  | "shophouse"       // Nhà phố thương mại / văn phòng
  | "industrial";     // Bất động sản công nghiệp

export interface PropertyInput {
  /** Giá mua tài sản (VNĐ) */
  price: number;
  /** Phân khúc - quyết định benchmark yield */
  segment: Segment;
}

export interface LoanInput {
  /** Tỷ lệ vốn tự có (0..1). Ví dụ 0.3 = 30% equity */
  equityRatio: number;
  /** Lãi suất vay danh nghĩa /năm (decimal). Ví dụ 0.09 = 9% */
  interestRate: number;
  /** Kỳ hạn vay (năm) */
  termYears: number;
}

export interface RentalInput {
  /** Tiền thuê thu được mỗi tháng (VNĐ/tháng) */
  monthlyRent: number;
  /** Tỷ lệ chi phí vận hành / tiền thuê (0..1). Bao gồm phí QL, sửa chữa, thuế. */
  operatingExpenseRatio: number;
  /** Tỷ lệ trống nhà bình quân (0..1). 0.08 = 1 tháng/năm */
  vacancyRate: number;
}

export interface MarketAssumptions {
  /** Tốc độ tăng giá tài sản /năm (decimal) */
  appreciationRate: number;
  /** Tốc độ tăng tiền thuê /năm (decimal) */
  rentGrowthRate: number;
  /** Lãi suất tiết kiệm tham chiếu /năm (decimal) - dùng so sánh */
  savingsRate: number;
  /** Thu nhập trung bình hộ gia đình /năm (VNĐ) - để tính P/I */
  householdAnnualIncome: number;
}

export interface ScenarioInput {
  property: PropertyInput;
  loan: LoanInput;
  rental: RentalInput;
  market: MarketAssumptions;
  /** Thời gian nắm giữ trước khi exit (năm) */
  holdingYears: number;
}

export interface YearlyProjection {
  year: number;
  /** Giá trị tài sản cuối năm */
  propertyValue: number;
  /** Dư nợ gốc cuối năm */
  outstandingPrincipal: number;
  /** Tổng trả nợ trong năm (gốc + lãi) */
  debtServicePaid: number;
  /** Tiền thuê thực thu trong năm (đã trừ trống nhà) */
  rentCollected: number;
  /** Chi phí vận hành trong năm */
  operatingExpense: number;
  /** Dòng tiền ròng trong năm (rentCollected - operatingExpense - debtService).
   *  Âm: nhà đầu tư phải bù từ thu nhập khác. */
  netCashFlow: number;
  /** Net asset = propertyValue - outstandingPrincipal */
  netAsset: number;
}

export interface ExitMetrics {
  /** Vốn gốc bỏ ra ban đầu (equity tại t=0) */
  initialEquity: number;
  /** Tổng tiền bù dòng tiền âm trong suốt holding period */
  totalCashInjection: number;
  /** Tổng vốn thực bỏ ra = initialEquity + totalCashInjection */
  totalCapitalDeployed: number;
  /** Net asset tại exit (đã trả hết dư nợ) */
  netAssetAtExit: number;
  /** Lợi nhuận ròng = netAssetAtExit - totalCapitalDeployed */
  netProfit: number;
  /** ROI trên totalCapitalDeployed (decimal) */
  roiOnTotalCapital: number;
  /** ROI trên initialEquity (decimal) - chỉ số "đòn bẩy" */
  roiOnInitialEquity: number;
  /** CAGR trên totalCapitalDeployed */
  cagrOnTotalCapital: number;
}

export interface YieldMetrics {
  grossYield: number;     // tiền thuê năm / giá tài sản
  netYield: number;       // sau chi phí và trống nhà
  /** Yield tham chiếu của phân khúc theo dữ liệu CBRE/Savills/Batdongsan */
  segmentBenchmark: {
    grossLow: number;
    grossHigh: number;
    netLow: number;
    netHigh: number;
  };
}

export type RiskLevel = "safe" | "warning" | "danger";

export interface RiskAssessment {
  /** Tỷ lệ tiền thuê khỏa lấp khoản trả góp tháng 1 (0..>1) */
  debtCoverageRatio: number;
  debtCoverageLevel: RiskLevel;
  /** Spread = appreciationRate - interestRate */
  appreciationVsInterestSpread: number;
  spreadLevel: RiskLevel;
  /** P/I = giá nhà / thu nhập hộ gia đình năm */
  priceToIncomeRatio: number;
  /** Vacancy stress: tổng cash injection thêm nếu trống N tháng/năm */
  vacancyStress: { vacantMonths: number; extraInjection: number }[];
  /** Net yield có vượt savingsRate không? */
  beatsSavingsRate: boolean;
  /** Tổng hợp các cảnh báo bằng ngôn ngữ tự nhiên */
  warnings: string[];
}

export interface ScenarioResult {
  input: ScenarioInput;
  yearly: YearlyProjection[];
  exit: ExitMetrics;
  yields: YieldMetrics;
  risk: RiskAssessment;
}
