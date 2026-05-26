"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND } from "@/engine";

export function YearlyTable({ result }: { result: ScenarioResult }) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Bảng dòng tiền chi tiết</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-surface-2 text-text-dim">
            <tr>
              <th className="text-left px-3 py-2">Năm</th>
              <th className="text-right px-3 py-2">Giá trị TS</th>
              <th className="text-right px-3 py-2">Dư nợ</th>
              <th className="text-right px-3 py-2">Tiền thuê thu</th>
              <th className="text-right px-3 py-2">Trả nợ</th>
              <th className="text-right px-3 py-2">Dòng tiền ròng</th>
              <th className="text-right px-3 py-2">Tài sản ròng</th>
            </tr>
          </thead>
          <tbody>
            {result.yearly.map((y) => (
              <tr key={y.year} className="border-t border-border/50">
                <td className="px-3 py-2 font-medium">{y.year}</td>
                <td className="px-3 py-2 text-right">
                  {formatVND(y.propertyValue)}
                </td>
                <td className="px-3 py-2 text-right text-text-dim">
                  {formatVND(y.outstandingPrincipal)}
                </td>
                <td className="px-3 py-2 text-right text-safe">
                  {formatVND(y.rentCollected)}
                </td>
                <td className="px-3 py-2 text-right text-warning">
                  {formatVND(y.debtServicePaid)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-medium ${y.netCashFlow < 0 ? "text-danger" : "text-safe"}`}
                >
                  {y.netCashFlow >= 0 ? "+" : ""}
                  {formatVND(y.netCashFlow)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
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
