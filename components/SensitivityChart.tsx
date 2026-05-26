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
import { useChartTokens } from "@/hooks/useChartTokens";

const VARIABLE_OPTIONS: SensitivityVariable[] = [
  "interestRate",
  "appreciationRate",
  "vacancyRate",
  "equityRatio",
  "rentGrowthRate",
  "holdingYears",
];

export function SensitivityChart({ scenario }: { scenario: ScenarioInput }) {
  const [variable, setVariable] = useState<SensitivityVariable>("interestRate");
  const t = useChartTokens();

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

  const tooltipStyle = {
    background: t.card,
    border: `1px solid ${t.divider}`,
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    fontSize: 12,
    fontWeight: 500,
    color: t.text,
    padding: "10px 14px",
  };

  return (
    <div className="a-card p-5">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h3 className="t-eyebrow text-text-muted">Sensitivity analysis</h3>
          <p className="t-body text-text-dim mt-1">
            Trượt 1 biến để xem ROI thay đổi. Các biến khác giữ nguyên.
          </p>
        </div>
        <select
          value={variable}
          onChange={(e) => setVariable(e.target.value as SensitivityVariable)}
          className="a-input"
          style={{ width: "auto", minWidth: 220 }}
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
          accent
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
            <CartesianGrid strokeDasharray="0" stroke={t.grid} />
            <XAxis
              dataKey="x"
              stroke={t.axis}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: t.grid }}
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) =>
                cfg.unit === "percent" ? `${v}%` : `${v}`
              }
            />
            <YAxis
              stroke={t.axis}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: t.grid }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ stroke: t.grid }}
              formatter={(v: number) => `${v}%`}
              labelFormatter={(v) =>
                `${cfg.label}: ${v}${cfg.unit === "percent" ? "%" : " năm"}`
              }
            />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            <ReferenceLine y={0} stroke={t.axis} strokeWidth={1} />
            <ReferenceLine
              x={currentDisplay}
              stroke={t.accent}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: "HIỆN TẠI",
                position: "top",
                fill: t.accent,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            />
            {breakevenDisplay !== null && (
              <ReferenceLine
                x={breakevenDisplay}
                stroke={t.warning}
                strokeWidth={1.5}
                strokeDasharray="2 4"
                label={{
                  value: "BREAKEVEN",
                  position: "top",
                  fill: t.warning,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="ROI / vốn gốc"
              stroke={t.success}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ROI / tổng vốn thực"
              stroke={t.accent}
              strokeWidth={2.5}
              dot={false}
            />
            <ReferenceDot
              x={closestPoint.x}
              y={closestPoint["ROI / tổng vốn thực"]}
              r={5}
              fill={t.accent}
              stroke={t.card}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="t-meta text-text-dim mt-4 leading-relaxed">
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="a-panel px-4 py-3"
      style={
        accent
          ? {
              background:
                "color-mix(in srgb, var(--accent) 10%, var(--surface))",
            }
          : undefined
      }
    >
      <div className="t-eyebrow text-text-muted">{label}</div>
      <div
        className="mt-1"
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.4px",
          color: accent ? "var(--accent)" : "var(--text)",
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-mono-stack), ui-monospace, monospace",
        }}
      >
        {value}
      </div>
    </div>
  );
}
