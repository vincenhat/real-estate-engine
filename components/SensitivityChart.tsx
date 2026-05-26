"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import type { ScenarioInput } from "@/engine";
import {
  sweep,
  VARIABLE_CONFIGS,
  type SensitivityVariable,
} from "@/engine";

const VARIABLE_OPTIONS: SensitivityVariable[] = [
  "interestRate",
  "appreciationRate",
  "vacancyRate",
  "equityRatio",
  "rentGrowthRate",
  "holdingYears",
];

interface Props {
  scenario: ScenarioInput;
}

export function SensitivityChart({ scenario }: Props) {
  const [variable, setVariable] = useState<SensitivityVariable>("interestRate");

  const curve = useMemo(() => sweep(scenario, variable), [scenario, variable]);
  const cfg = VARIABLE_CONFIGS[variable];

  const data = curve.points.map((p) => ({
    x: cfg.unit === "percent" ? +(p.x * 100).toFixed(2) : p.x,
    "ROI / vốn gốc": +(p.roiOnInitialEquity * 100).toFixed(1),
    "ROI / tổng vốn thực": +(p.roiOnTotalCapital * 100).toFixed(1),
  }));

  const currentDisplay =
    cfg.unit === "percent"
      ? +(curve.currentX * 100).toFixed(2)
      : curve.currentX;
  const breakevenDisplay =
    curve.breakevenX !== null
      ? cfg.unit === "percent"
        ? +(curve.breakevenX * 100).toFixed(2)
        : curve.breakevenX
      : null;

  // Tìm ROI tại currentX (gần nhất) để vẽ dot
  const closestPoint = data.reduce((acc, p) =>
    Math.abs(p.x - currentDisplay) < Math.abs(acc.x - currentDisplay) ? p : acc,
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold">Sensitivity analysis</h3>
          <p className="text-[11px] text-text-dim">
            Trượt 1 biến để xem ROI thay đổi. Các biến khác giữ nguyên.
          </p>
        </div>
        <select
          value={variable}
          onChange={(e) => setVariable(e.target.value as SensitivityVariable)}
          className="rounded bg-surface-2 border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
        >
          {VARIABLE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {VARIABLE_CONFIGS[v].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <Stat
          label="Vị trí hiện tại"
          value={
            cfg.unit === "percent"
              ? `${currentDisplay}%`
              : `${currentDisplay} năm`
          }
          tone="accent"
        />
        <Stat
          label="ROI tại vị trí này"
          value={`${closestPoint["ROI / tổng vốn thực"]}%`}
        />
        <Stat
          label="Breakeven (ROI = 0)"
          value={
            breakevenDisplay !== null
              ? cfg.unit === "percent"
                ? `${breakevenDisplay}%`
                : `${Math.round(breakevenDisplay)} năm`
              : "—"
          }
          tone={breakevenDisplay !== null ? "warning" : undefined}
        />
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis
              dataKey="x"
              stroke="#9aa3b2"
              fontSize={11}
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) =>
                cfg.unit === "percent" ? `${v}%` : `${v}`
              }
            />
            <YAxis
              stroke="#9aa3b2"
              fontSize={11}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#131722",
                border: "1px solid #2a3142",
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(v: number) => `${v}%`}
              labelFormatter={(v) =>
                `${cfg.label}: ${v}${cfg.unit === "percent" ? "%" : " năm"}`
              }
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#9aa3b2" strokeDasharray="4 4" />
            <ReferenceLine
              x={currentDisplay}
              stroke="#3b82f6"
              strokeDasharray="4 4"
              label={{
                value: "Hiện tại",
                position: "top",
                fill: "#3b82f6",
                fontSize: 11,
              }}
            />
            {breakevenDisplay !== null && (
              <ReferenceLine
                x={breakevenDisplay}
                stroke="#f59e0b"
                strokeDasharray="2 4"
                label={{
                  value: "Breakeven",
                  position: "top",
                  fill: "#f59e0b",
                  fontSize: 11,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="ROI / vốn gốc"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ROI / tổng vốn thực"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceDot
              x={closestPoint.x}
              y={closestPoint["ROI / tổng vốn thực"]}
              r={5}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-text-dim mt-2">
        Đường xanh dương = ROI trên tổng vốn thực (đã cộng tiền bù dòng tiền âm).
        Đường xanh lá = ROI trên vốn gốc ban đầu (không tính tiền bù).
        {breakevenDisplay !== null && (
          <>
            {" "}
            Tại {breakevenDisplay}
            {cfg.unit === "percent" ? "%" : " năm"}, kịch bản hòa vốn.
          </>
        )}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent" | "warning";
}) {
  const toneClass =
    tone === "accent"
      ? "border-accent/40 bg-accent/5"
      : tone === "warning"
        ? "border-warning/40 bg-warning/5"
        : "border-border bg-surface-2";
  return (
    <div className={`rounded border ${toneClass} px-3 py-2`}>
      <div className="text-text-dim text-[10px] uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
