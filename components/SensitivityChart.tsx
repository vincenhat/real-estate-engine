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
  C_PRIMARY,
  C_SECONDARY,
  C_SUCCESS,
  C_WARNING,
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
    <div className="brut-card p-4">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap pb-2 border-b-2 border-border">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest">
            Sensitivity analysis
          </h3>
          <p className="text-[11px] text-text-dim mt-1">
            Trượt 1 biến để xem ROI thay đổi. Các biến khác giữ nguyên.
          </p>
        </div>
        <select
          value={variable}
          onChange={(e) => setVariable(e.target.value as SensitivityVariable)}
          className="brut-input !w-auto text-xs font-bold"
        >
          {VARIABLE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {VARIABLE_CONFIGS[v].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat
          label="Vị trí hiện tại"
          value={
            cfg.unit === "percent"
              ? `${currentDisplay}%`
              : `${currentDisplay} năm`
          }
          tone="primary"
        />
        <Stat
          label="ROI tại điểm này"
          value={`${closestPoint["ROI / tổng vốn thực"]}%`}
          tone="default"
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
          tone={breakevenDisplay !== null ? "warning" : "default"}
        />
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="0" stroke={C_DIM} opacity={0.2} />
            <XAxis
              dataKey="x"
              stroke={C_TEXT}
              fontSize={11}
              fontWeight={600}
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) =>
                cfg.unit === "percent" ? `${v}%` : `${v}`
              }
            />
            <YAxis
              stroke={C_TEXT}
              fontSize={11}
              fontWeight={600}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => `${v}%`}
              labelFormatter={(v) =>
                `${cfg.label}: ${v}${cfg.unit === "percent" ? "%" : " năm"}`
              }
            />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
            <ReferenceLine y={0} stroke={C_TEXT} strokeWidth={2} />
            <ReferenceLine
              x={currentDisplay}
              stroke={C_SECONDARY}
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: "HIỆN TẠI",
                position: "top",
                fill: C_SECONDARY,
                fontSize: 10,
                fontWeight: 800,
              }}
            />
            {breakevenDisplay !== null && (
              <ReferenceLine
                x={breakevenDisplay}
                stroke={C_WARNING}
                strokeWidth={2}
                strokeDasharray="2 4"
                label={{
                  value: "BREAKEVEN",
                  position: "top",
                  fill: C_WARNING,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="ROI / vốn gốc"
              stroke={C_SUCCESS}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ROI / tổng vốn thực"
              stroke={C_SECONDARY}
              strokeWidth={3}
              dot={false}
            />
            <ReferenceDot
              x={closestPoint.x}
              y={closestPoint["ROI / tổng vốn thực"]}
              r={6}
              fill={C_PRIMARY}
              stroke={C_TEXT}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-text-dim mt-3 leading-relaxed">
        Đường xanh dương = ROI trên tổng vốn thực (đã cộng tiền bù dòng tiền âm).
        Đường xanh lá = ROI trên vốn gốc ban đầu.
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

type StatTone = "primary" | "warning" | "default";

const STAT_TONE: Record<StatTone, string> = {
  primary: "bg-primary",
  warning: "bg-warning text-card",
  default: "bg-card",
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: StatTone;
}) {
  return (
    <div className={`border-2 border-border px-3 py-2 ${STAT_TONE[tone]}`}>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">
        {label}
      </div>
      <div className="text-base font-black mt-0.5 font-mono">{value}</div>
    </div>
  );
}
