"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ScenarioResult } from "@/engine";
import { useChartTokens } from "@/hooks/useChartTokens";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="a-card p-5">
      <h3 className="t-eyebrow text-text-muted mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function ProjectionChart({ result }: { result: ScenarioResult }) {
  const t = useChartTokens();
  const data = result.yearly.map((y) => ({
    year: `Y${y.year}`,
    "Giá trị tài sản": Math.round(y.propertyValue / 1_000_000),
    "Dư nợ": Math.round(y.outstandingPrincipal / 1_000_000),
    "Tài sản ròng": Math.round(y.netAsset / 1_000_000),
  }));

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
    <ChartCard title="Tài sản & dư nợ — triệu VNĐ">
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={t.grid} />
            <XAxis
              dataKey="year"
              stroke={t.axis}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: t.grid }}
            />
            <YAxis
              stroke={t.axis}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: t.grid }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: t.grid }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            <Line
              type="monotone"
              dataKey="Giá trị tài sản"
              stroke={t.accent}
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dư nợ"
              stroke={t.danger}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Tài sản ròng"
              stroke={t.success}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function CashFlowChart({ result }: { result: ScenarioResult }) {
  const t = useChartTokens();
  const data = result.yearly.map((y) => ({
    year: `Y${y.year}`,
    "Tiền thuê thu": Math.round(y.rentCollected / 1_000_000),
    "Trả nợ": Math.round(y.debtServicePaid / 1_000_000),
    "Dòng tiền ròng": Math.round(y.netCashFlow / 1_000_000),
  }));

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
    <ChartCard title="Dòng tiền hàng năm — triệu VNĐ">
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={t.grid} />
            <XAxis
              dataKey="year"
              stroke={t.axis}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: t.grid }}
            />
            <YAxis
              stroke={t.axis}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: t.grid }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: t.grid }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            <Line
              type="monotone"
              dataKey="Tiền thuê thu"
              stroke={t.success}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Trả nợ"
              stroke={t.warning}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dòng tiền ròng"
              stroke={t.accent}
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
