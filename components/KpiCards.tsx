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
          className="a-card p-5"
          style={
            c.featured
              ? {
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, var(--card)) 0%, var(--card) 100%)",
                  borderColor:
                    "color-mix(in srgb, var(--accent) 30%, var(--divider))",
                }
              : undefined
          }
        >
          <div className="t-eyebrow text-text-muted">{c.label}</div>
          <div
            className="mt-3"
            style={{
              fontSize: 32,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              color: c.featured ? "var(--accent)" : "var(--text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {c.value}
          </div>
          <div className="t-meta text-text-dim mt-2">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
