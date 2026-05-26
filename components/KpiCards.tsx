"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND, formatPercent, formatMultiplier } from "@/engine";

type Tone = "default" | "primary" | "secondary" | "success" | "danger";

const TONE_BG: Record<Tone, string> = {
  default: "bg-card",
  primary: "bg-primary",
  secondary: "bg-secondary text-card",
  success: "bg-success text-card",
  danger: "bg-danger text-card",
};

export function KpiCards({ result }: { result: ScenarioResult }) {
  const { exit, yields } = result;

  const cards: { label: string; value: string; sub: string; tone: Tone }[] = [
    {
      label: "Giá trị tài sản tại exit",
      value: formatVND(result.yearly[result.yearly.length - 1].propertyValue),
      sub: `Sau ${result.input.holdingYears} năm`,
      tone: "default",
    },
    {
      label: "Tài sản ròng",
      value: formatVND(exit.netAssetAtExit),
      sub: `Lợi nhuận ròng ${formatVND(exit.netProfit)}`,
      tone: exit.netProfit >= 0 ? "default" : "danger",
    },
    {
      label: "ROI / Vốn gốc",
      value: formatMultiplier(1 + exit.roiOnInitialEquity),
      sub: `${formatPercent(exit.roiOnInitialEquity, 0)} sinh lời`,
      tone: "primary",
    },
    {
      label: "ROI / Tổng vốn thực",
      value: formatPercent(exit.roiOnTotalCapital, 0),
      sub: `Đã cộng ${formatVND(exit.totalCashInjection)} bù dòng tiền`,
      tone: "default",
    },
    {
      label: "CAGR",
      value: formatPercent(exit.cagrOnTotalCapital, 1),
      sub: "Tăng trưởng kép trên vốn thực",
      tone: "default",
    },
    {
      label: "Net yield",
      value: formatPercent(yields.netYield, 2),
      sub: `Benchmark: ${formatPercent(yields.segmentBenchmark.netLow)} – ${formatPercent(yields.segmentBenchmark.netHigh)}`,
      tone: "default",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`brut-card p-4 ${TONE_BG[c.tone]}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            {c.label}
          </div>
          <div className="text-2xl font-black mt-2 leading-none">{c.value}</div>
          <div className="text-[11px] font-medium mt-2 opacity-75">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
