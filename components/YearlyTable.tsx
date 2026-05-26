"use client";

import type { ScenarioResult } from "@/engine";
import { formatVND } from "@/engine";

export function YearlyTable({ result }: { result: ScenarioResult }) {
  return (
    <div className="a-card overflow-hidden">
      <div
        className="px-4 lg:px-5 py-4"
        style={{ borderBottom: "1px solid var(--divider)" }}
      >
        <h3 className="t-eyebrow text-text-muted">Bảng dòng tiền chi tiết</h3>
      </div>

      {/* Desktop: full table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-3 t-eyebrow text-text-muted">Năm</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Giá trị TS</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Dư nợ</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Tiền thuê</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">Trả nợ</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">CF ròng</th>
              <th className="text-right px-4 py-3 t-eyebrow text-text-muted">TS ròng</th>
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

      {/* Mobile: card stack — mỗi năm là 1 card riêng cho dễ đọc */}
      <ul className="md:hidden divide-y" style={{ borderColor: "var(--divider)" }}>
        {result.yearly.map((y) => (
          <li
            key={y.year}
            className="px-4 py-3 space-y-2"
            style={{ borderTop: "1px solid var(--divider)", fontVariantNumeric: "tabular-nums" }}
          >
            <div className="flex items-baseline justify-between">
              <span className="t-control-strong text-text">Năm {y.year}</span>
              <span
                className={`text-sm font-semibold font-mono ${y.netCashFlow < 0 ? "text-danger" : "text-accent"}`}
              >
                {y.netCashFlow >= 0 ? "+" : ""}
                {formatVND(y.netCashFlow)}
                <span className="t-meta text-text-muted font-normal ml-1">CF</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] font-mono">
              <Cell label="Giá trị" value={formatVND(y.propertyValue)} />
              <Cell label="Dư nợ" value={formatVND(y.outstandingPrincipal)} dim />
              <Cell label="Tiền thuê" value={formatVND(y.rentCollected)} className="text-success" />
              <Cell label="Trả nợ" value={formatVND(y.debtServicePaid)} className="text-warning" />
              <Cell
                label="Tài sản ròng"
                value={formatVND(y.netAsset)}
                strong
                className="col-span-2 pt-1"
                style={{ borderTop: "1px solid var(--divider)" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cell({
  label,
  value,
  dim,
  strong,
  className = "",
  style,
}: {
  label: string;
  value: string;
  dim?: boolean;
  strong?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`flex justify-between ${className}`} style={style}>
      <span className="t-meta text-text-muted font-sans">{label}</span>
      <span
        className={`${strong ? "font-semibold text-text" : dim ? "text-text-dim" : "text-text"}`}
      >
        {value}
      </span>
    </div>
  );
}
