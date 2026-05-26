"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND, formatPercent, formatMultiplier } from "@/engine";

export function KpiCards({ result }: { result: ScenarioResult }) {
  const { exit, yields } = result;

  const cards: { label: string; value: string; sub: string; featured?: boolean }[] = [
    {
      label: "Giá trị tài sản tại exit",
      value: formatVND(result.yearly[result.yearly.length - 1].propertyValue),
      sub: `Sau ${result.input.holdingYears} năm`,
    },
    {
      label: "Tài sản ròng",
      value: formatVND(exit.netAssetAtExit),
      sub: `Lợi nhuận ròng ${formatVND(exit.netProfit)}`,
    },
    {
      label: "ROI / Vốn gốc",
      value: formatMultiplier(1 + exit.roiOnInitialEquity),
      sub: `${formatPercent(exit.roiOnInitialEquity, 0)} sinh lời`,
      featured: true,
    },
    {
      label: "ROI / Tổng vốn thực",
      value: formatPercent(exit.roiOnTotalCapital, 0),
      sub: `Đã cộng ${formatVND(exit.totalCashInjection)} bù dòng tiền`,
    },
    {
      label: "CAGR",
      value: formatPercent(exit.cagrOnTotalCapital, 1),
      sub: "Tăng trưởng kép trên vốn thực",
    },
    {
      label: "Net yield",
      value: formatPercent(yields.netYield, 2),
      sub: `Benchmark: ${formatPercent(yields.segmentBenchmark.netLow)} – ${formatPercent(yields.segmentBenchmark.netHigh)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`${c.featured ? "v-card-featured" : "v-card"} p-5`}
        >
          <div className="t-mono-label text-text-muted">{c.label}</div>
          <div
            className="mt-2 font-semibold"
            style={{
              fontSize: 32,
              lineHeight: 1.1,
              letterSpacing: "-1.28px",
              color: "var(--text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {c.value}
          </div>
          <div className="t-caption text-text-dim mt-2">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
