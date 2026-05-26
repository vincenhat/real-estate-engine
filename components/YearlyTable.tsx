"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND } from "@/engine";

export function YearlyTable({ result }: { result: ScenarioResult }) {
  return (
    <div className="brut-card overflow-hidden">
      <div className="px-4 py-3 border-b-2 border-border">
        <h3 className="text-xs font-black uppercase tracking-widest">
          Bảng dòng tiền chi tiết
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-text text-card">
            <tr>
              <th className="text-left px-3 py-2 font-bold uppercase tracking-wider">
                Năm
              </th>
              <th className="text-right px-3 py-2 font-bold uppercase tracking-wider">
                Giá trị TS
              </th>
              <th className="text-right px-3 py-2 font-bold uppercase tracking-wider">
                Dư nợ
              </th>
              <th className="text-right px-3 py-2 font-bold uppercase tracking-wider">
                Tiền thuê
              </th>
              <th className="text-right px-3 py-2 font-bold uppercase tracking-wider">
                Trả nợ
              </th>
              <th className="text-right px-3 py-2 font-bold uppercase tracking-wider">
                CF ròng
              </th>
              <th className="text-right px-3 py-2 font-bold uppercase tracking-wider">
                Tài sản ròng
              </th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {result.yearly.map((y, i) => (
              <tr
                key={y.year}
                className={`border-t-2 border-border ${i % 2 === 0 ? "bg-card" : "bg-surface"}`}
              >
                <td className="px-3 py-2 font-black">{y.year}</td>
                <td className="px-3 py-2 text-right">
                  {formatVND(y.propertyValue)}
                </td>
                <td className="px-3 py-2 text-right text-text-dim">
                  {formatVND(y.outstandingPrincipal)}
                </td>
                <td className="px-3 py-2 text-right text-success font-semibold">
                  {formatVND(y.rentCollected)}
                </td>
                <td className="px-3 py-2 text-right text-warning font-semibold">
                  {formatVND(y.debtServicePaid)}
                </td>
                <td
                  className={`px-3 py-2 text-right font-bold ${y.netCashFlow < 0 ? "text-danger" : "text-success"}`}
                >
                  {y.netCashFlow >= 0 ? "+" : ""}
                  {formatVND(y.netCashFlow)}
                </td>
                <td className="px-3 py-2 text-right font-black">
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
