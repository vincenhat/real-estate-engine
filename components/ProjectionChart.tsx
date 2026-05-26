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

const C_TEXT = "#1c293c";
const C_BORDER = "#1c293c";
const C_DIM = "#5a6878";
const C_PRIMARY = "#fdc800";
const C_SECONDARY = "#432dd7";
const C_DANGER = "#dc2626";
const C_SUCCESS = "#16a34a";
const C_WARNING = "#d97706";

const tooltipStyle = {
  background: "#ffffff",
  border: `2px solid ${C_BORDER}`,
  boxShadow: `4px 4px 0 ${C_BORDER}`,
  borderRadius: 0,
  fontSize: 12,
  fontWeight: 500,
  color: C_TEXT,
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="brut-card p-4">
      <h3 className="text-xs font-black uppercase tracking-widest mb-3 pb-2 border-b-2 border-border">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ProjectionChart({ result }: { result: ScenarioResult }) {
  const data = result.yearly.map((y) => ({
    year: `Y${y.year}`,
    "Giá trị tài sản": Math.round(y.propertyValue / 1_000_000),
    "Dư nợ": Math.round(y.outstandingPrincipal / 1_000_000),
    "Tài sản ròng": Math.round(y.netAsset / 1_000_000),
  }));

  return (
    <ChartCard title="Tài sản & dư nợ (triệu VNĐ)">
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={C_DIM} opacity={0.2} />
            <XAxis
              dataKey="year"
              stroke={C_TEXT}
              fontSize={11}
              fontWeight={600}
            />
            <YAxis stroke={C_TEXT} fontSize={11} fontWeight={600} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
            <Line
              type="monotone"
              dataKey="Giá trị tài sản"
              stroke={C_SECONDARY}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dư nợ"
              stroke={C_DANGER}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Tài sản ròng"
              stroke={C_SUCCESS}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function CashFlowChart({ result }: { result: ScenarioResult }) {
  const data = result.yearly.map((y) => ({
    year: `Y${y.year}`,
    "Tiền thuê thu": Math.round(y.rentCollected / 1_000_000),
    "Trả nợ": Math.round(y.debtServicePaid / 1_000_000),
    "Dòng tiền ròng": Math.round(y.netCashFlow / 1_000_000),
  }));

  return (
    <ChartCard title="Dòng tiền hàng năm (triệu VNĐ)">
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={C_DIM} opacity={0.2} />
            <XAxis
              dataKey="year"
              stroke={C_TEXT}
              fontSize={11}
              fontWeight={600}
            />
            <YAxis stroke={C_TEXT} fontSize={11} fontWeight={600} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
            <Line
              type="monotone"
              dataKey="Tiền thuê thu"
              stroke={C_SUCCESS}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Trả nợ"
              stroke={C_WARNING}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dòng tiền ròng"
              stroke={C_SECONDARY}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export {
  C_TEXT,
  C_BORDER,
  C_DIM,
  C_PRIMARY,
  C_SECONDARY,
  C_DANGER,
  C_SUCCESS,
  C_WARNING,
  tooltipStyle,
};
