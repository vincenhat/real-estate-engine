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

export function ProjectionChart({ result }: { result: ScenarioResult }) {
  const data = result.yearly.map((y) => ({
    year: `Năm ${y.year}`,
    "Giá trị tài sản": Math.round(y.propertyValue / 1_000_000),
    "Dư nợ": Math.round(y.outstandingPrincipal / 1_000_000),
    "Tài sản ròng": Math.round(y.netAsset / 1_000_000),
  }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold mb-3">
        Giá trị tài sản, dư nợ & net asset (triệu VNĐ)
      </h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis dataKey="year" stroke="#9aa3b2" fontSize={12} />
            <YAxis stroke="#9aa3b2" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#131722",
                border: "1px solid #2a3142",
                borderRadius: 6,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Giá trị tài sản"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dư nợ"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Tài sản ròng"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CashFlowChart({ result }: { result: ScenarioResult }) {
  const data = result.yearly.map((y) => ({
    year: `Năm ${y.year}`,
    "Tiền thuê thu": Math.round(y.rentCollected / 1_000_000),
    "Trả nợ": Math.round(y.debtServicePaid / 1_000_000),
    "Dòng tiền ròng": Math.round(y.netCashFlow / 1_000_000),
  }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold mb-3">
        Dòng tiền hàng năm (triệu VNĐ)
      </h3>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3142" />
            <XAxis dataKey="year" stroke="#9aa3b2" fontSize={12} />
            <YAxis stroke="#9aa3b2" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#131722",
                border: "1px solid #2a3142",
                borderRadius: 6,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Tiền thuê thu"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Trả nợ"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Dòng tiền ròng"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
