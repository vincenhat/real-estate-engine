"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND } from "@/engine";

export function YearlyTable({ result }: { result: ScenarioResult }) {
  return (
    <div className="v-card overflow-hidden">
      <div className="px-5 py-4 shadow-border">
        <h3 className="t-mono-label text-text-muted">Bảng dòng tiền chi tiết</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr className="text-text-muted">
              <th className="text-left px-4 py-3 t-mono-label">Năm</th>
              <th className="text-right px-4 py-3 t-mono-label">Giá trị TS</th>
              <th className="text-right px-4 py-3 t-mono-label">Dư nợ</th>
              <th className="text-right px-4 py-3 t-mono-label">Tiền thuê</th>
              <th className="text-right px-4 py-3 t-mono-label">Trả nợ</th>
              <th className="text-right px-4 py-3 t-mono-label">CF ròng</th>
              <th className="text-right px-4 py-3 t-mono-label">Tài sản ròng</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13px]">
            {result.yearly.map((y) => (
              <tr
                key={y.year}
                style={{
                  boxShadow: "rgb(235, 235, 235) 0px 1px 0px 0px inset",
                }}
              >
                <td className="px-4 py-2.5 font-semibold text-text">{y.year}</td>
                <td className="px-4 py-2.5 text-right text-text">
                  {formatVND(y.propertyValue)}
                </td>
                <td className="px-4 py-2.5 text-right text-text-muted">
                  {formatVND(y.outstandingPrincipal)}
                </td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{ color: "#de1d8d" }}
                >
                  {formatVND(y.rentCollected)}
                </td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{ color: "#ff5b4f" }}
                >
                  {formatVND(y.debtServicePaid)}
                </td>
                <td
                  className="px-4 py-2.5 text-right font-semibold"
                  style={{ color: y.netCashFlow < 0 ? "#dc2626" : "#0a72ef" }}
                >
                  {y.netCashFlow >= 0 ? "+" : ""}
                  {formatVND(y.netCashFlow)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-text">
                  {formatVND(y.netAsset)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
