/**
 * Benchmark dữ liệu thị trường VN trích từ báo cáo CBRE, Savills,
 * Batdongsan.com.vn, VARS, BIDV (2024-2025).
 *
 * Đơn vị: decimal (0.04 = 4%).
 */

import type { Segment } from "./types";

export interface SegmentBenchmark {
  grossLow: number;
  grossHigh: number;
  netLow: number;
  netHigh: number;
  label: string;
}

export const SEGMENT_BENCHMARKS: Record<Segment, SegmentBenchmark> = {
  midCondo: {
    label: "Căn hộ trung cấp",
    grossLow: 0.04,
    grossHigh: 0.05,
    netLow: 0.03,
    netHigh: 0.04,
  },
  luxuryCondo: {
    label: "Căn hộ cao cấp / Hạng sang",
    grossLow: 0.03,
    grossHigh: 0.04,
    netLow: 0.02,
    netHigh: 0.03,
  },
  shophouse: {
    label: "Nhà phố thương mại / Văn phòng",
    grossLow: 0.05,
    grossHigh: 0.07,
    netLow: 0.04,
    netHigh: 0.055,
  },
  industrial: {
    label: "Bất động sản công nghiệp",
    grossLow: 0.07,
    grossHigh: 0.09,
    netLow: 0.06,
    netHigh: 0.075,
  },
};

/** Yield trung bình toàn thị trường VN quý 3/2025 (Batdongsan.com.vn). */
export const MARKET_YIELD_2025 = 0.022;

/** P/I ratio Việt Nam vs toàn cầu (BIDV / Cấn Văn Lực, 2024). */
export const PI_RATIO_VN = 27.3;
export const PI_RATIO_GLOBAL = 14.6;

/** Lãi suất tiết kiệm tham chiếu (kỳ hạn 12 tháng, NHTM lớn, 2025). */
export const DEFAULT_SAVINGS_RATE = 0.055;

/** Lãi suất vay mua nhà tham chiếu (NHTM, 2025). */
export const DEFAULT_MORTGAGE_RATE = 0.09;
