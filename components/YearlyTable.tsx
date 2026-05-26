"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND } from "@/engine";

export function YearlyTable({ result }: { result: ScenarioResult }) {
  return (
    <div className="a-card overflow-hidden">
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid var(--divider)" }}
      >
        <h3 className="t-eyebrow text-text-muted">Bảng dòng tiền chi tiết</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-3 t-eyebrow text-text-muted">Năm</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Giá trị TS</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Dư nợ</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Tiền thuê</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Trả nợ</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">CF ròng</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Tài sản ròng</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[13px]">
            {result.yearly.map((y) => (
              <tr
                key={y.year}
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                <td className="px-4 py-2.5 font-semibold text-text">{y.year}</td>
                <td className="px-4 py-2.5 text-right text-text">
                  {formatVND(y.propertyValue)}
                </td>
                <td className="px-4 py-2.5 text-right text-text-dim">
                  {formatVND(y.outstandingPrincipal)}
                </td>
                <td className="px-4 py-2.5 text-right text-success">
                  {formatVND(y.rentCollected)}
                </td>
                <td className="px-4 py-2.5 text-right text-warning">
                  {formatVND(y.debtServicePaid)}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-semibold ${y.netCashFlow < 0 ? "text-danger" : "text-accent"}`}
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
