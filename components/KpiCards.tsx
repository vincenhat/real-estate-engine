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
      sub: `Lãi ròng ${formatVND(exit.netProfit)}`,
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
      sub: `Bù dòng tiền ${formatVND(exit.totalCashInjection)}`,
    },
    {
      label: "CAGR",
      value: formatPercent(exit.cagrOnTotalCapital, 1),
      sub: "Tăng trưởng kép",
    },
    {
      label: "Net yield",
      value: formatPercent(yields.netYield, 2),
      sub: `Chuẩn ${formatPercent(yields.segmentBenchmark.netLow)}–${formatPercent(yields.segmentBenchmark.netHigh)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="a-card p-4 lg:p-5 min-w-0"
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
          <div className="t-eyebrow text-text-muted truncate">{c.label}</div>
          <div
            className="mt-2 lg:mt-3 truncate"
            style={{
              fontSize: "clamp(20px, 5vw, 32px)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              color: c.featured ? "var(--accent)" : "var(--text)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {c.value}
          </div>
          <div className="t-meta text-text-dim mt-1 lg:mt-2 truncate">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
