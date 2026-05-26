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
import { sweep, VARIABLE_CONFIGS, type SensitivityVariable } from "@/engine";
import {
  C_TEXT,
  C_DIM,
  C_GRID,
  C_DEVELOP,
  C_PREVIEW,
  C_CONSOLE_PURPLE,
  tooltipStyle,
} from "./ProjectionChart";

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

  const closestPoint = data.reduce((acc, p) =>
    Math.abs(p.x - currentDisplay) < Math.abs(acc.x - currentDisplay) ? p : acc,
  );

  return (
    <div className="v-card-featured p-5">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h3 className="t-mono-label text-text-muted">Sensitivity analysis</h3>
          <p className="t-body mt-1 text-text-dim">
            Trượt 1 biến để xem ROI thay đổi. Các biến khác giữ nguyên.
          </p>
        </div>
        <select
          value={variable}
          onChange={(e) => setVariable(e.target.value as SensitivityVariable)}
          className="v-input"
          style={{ width: "auto", minWidth: 200 }}
        >
          {VARIABLE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {VARIABLE_CONFIGS[v].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat
          label="Vị trí hiện tại"
          value={
            cfg.unit === "percent"
              ? `${currentDisplay}%`
              : `${currentDisplay} năm`
          }
        />
        <Stat
          label="ROI tại điểm này"
          value={`${closestPoint["ROI / tổng vốn thực"]}%`}
        />
        <Stat
          label="Breakeven"
          value={
            breakevenDisplay !== null
              ? cfg.unit === "percent"
                ? `${breakevenDisplay}%`
                : `${Math.round(breakevenDisplay)} năm`
              : "—"
          }
        />
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 16, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={C_GRID} />
            <XAxis
              dataKey="x"
              stroke={C_DIM}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: C_GRID }}
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) =>
                cfg.unit === "percent" ? `${v}%` : `${v}`
              }
            />
            <YAxis
              stroke={C_DIM}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: C_GRID }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ stroke: C_GRID }}
              formatter={(v: number) => `${v}%`}
              labelFormatter={(v) =>
                `${cfg.label}: ${v}${cfg.unit === "percent" ? "%" : " năm"}`
              }
            />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            <ReferenceLine y={0} stroke={C_TEXT} strokeWidth={1} />
            <ReferenceLine
              x={currentDisplay}
              stroke={C_TEXT}
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{
                value: "CURRENT",
                position: "top",
                fill: C_TEXT,
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            {breakevenDisplay !== null && (
              <ReferenceLine
                x={breakevenDisplay}
                stroke={C_CONSOLE_PURPLE}
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: "BREAKEVEN",
                  position: "top",
                  fill: C_CONSOLE_PURPLE,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="ROI / vốn gốc"
              stroke={C_PREVIEW}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ROI / tổng vốn thực"
              stroke={C_DEVELOP}
              strokeWidth={2}
              dot={false}
            />
            <ReferenceDot
              x={closestPoint.x}
              y={closestPoint["ROI / tổng vốn thực"]}
              r={4}
              fill={C_DEVELOP}
              stroke="#ffffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="t-caption text-text-muted mt-4 leading-relaxed">
        ROI / tổng vốn thực đã cộng tiền bù dòng tiền âm. ROI / vốn gốc chỉ tính
        khoản đầu tư ban đầu.
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md shadow-border bg-card px-4 py-3">
      <div className="t-mono-label text-text-muted">{label}</div>
      <div
        className="mt-1 font-semibold text-text"
        style={{
          fontSize: 20,
          letterSpacing: "-0.4px",
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {value}
      </div>
    </div>
  );
}
