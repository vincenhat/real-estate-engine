"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND, formatPercent, formatMultiplier } from "@/engine";

export function KpiCards({ result }: { result: ScenarioResult }) {
  const { exit, yields } = result;

  const cards = [
    {
      label: "Giá trị tài sản tại exit",
      value: formatVND(result.yearly[result.yearly.length - 1].propertyValue),
      sub: `Sau ${result.input.holdingYears} năm`,
    },
    {
      label: "Tài sản ròng (sau trả nợ)",
      value: formatVND(exit.netAssetAtExit),
      sub: `Lợi nhuận ròng ${formatVND(exit.netProfit)}`,
    },
    {
      label: "ROI / Vốn gốc",
      value: formatMultiplier(1 + exit.roiOnInitialEquity),
      sub: `${formatPercent(exit.roiOnInitialEquity, 0)} sinh lời`,
      tone: "accent" as const,
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
      sub: `Benchmark phân khúc: ${formatPercent(yields.segmentBenchmark.netLow)} - ${formatPercent(yields.segmentBenchmark.netHigh)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-lg border p-4 ${
            c.tone === "accent"
              ? "border-accent/40 bg-accent/5"
              : "border-border bg-surface"
          }`}
        >
          <div className="text-xs text-text-dim">{c.label}</div>
          <div className="text-2xl font-semibold mt-1">{c.value}</div>
          <div className="text-xs text-text-dim mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
