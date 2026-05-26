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

const C_TEXT = "#171717";
const C_DIM = "#4d4d4d";
const C_GRID = "#ebebeb";

// Workflow accents — only used to map "develop / preview / ship" semantic
// onto the financial timeline: develop=value, preview=net asset, ship=debt.
const C_DEVELOP = "#0a72ef";
const C_PREVIEW = "#de1d8d";
const C_SHIP = "#ff5b4f";
const C_CONSOLE_PURPLE = "#7928ca";

const tooltipStyle = {
  background: "#ffffff",
  border: "none",
  borderRadius: 6,
  boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 8px",
  fontSize: 12,
  fontWeight: 500,
  color: C_TEXT,
  padding: "8px 12px",
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="v-card p-5">
      <h3 className="t-mono-label text-text-muted mb-4">{title}</h3>
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
    <ChartCard title="Tài sản & dư nợ — triệu VNĐ">
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={C_GRID} />
            <XAxis
              dataKey="year"
              stroke={C_DIM}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: C_GRID }}
            />
            <YAxis
              stroke={C_DIM}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: C_GRID }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: C_GRID }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            <Line
              type="monotone"
              dataKey="Giá trị tài sản"
              stroke={C_DEVELOP}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dư nợ"
              stroke={C_SHIP}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Tài sản ròng"
              stroke={C_PREVIEW}
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
  const data = result.yearly.map((y) => ({
    year: `Y${y.year}`,
    "Tiền thuê thu": Math.round(y.rentCollected / 1_000_000),
    "Trả nợ": Math.round(y.debtServicePaid / 1_000_000),
    "Dòng tiền ròng": Math.round(y.netCashFlow / 1_000_000),
  }));

  return (
    <ChartCard title="Dòng tiền hàng năm — triệu VNĐ">
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke={C_GRID} />
            <XAxis
              dataKey="year"
              stroke={C_DIM}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: C_GRID }}
            />
            <YAxis
              stroke={C_DIM}
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: C_GRID }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: C_GRID }} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            <Line
              type="monotone"
              dataKey="Tiền thuê thu"
              stroke={C_PREVIEW}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Trả nợ"
              stroke={C_SHIP}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dòng tiền ròng"
              stroke={C_DEVELOP}
              strokeWidth={2}
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
  C_DIM,
  C_GRID,
  C_DEVELOP,
  C_PREVIEW,
  C_SHIP,
  C_CONSOLE_PURPLE,
  tooltipStyle,
};
