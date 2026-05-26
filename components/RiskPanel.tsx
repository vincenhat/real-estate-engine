"use client";

import type { ScenarioResult, RiskLevel } from "@/engine";
import { formatPercent, formatVND, PI_RATIO_GLOBAL, PI_RATIO_VN } from "@/engine";

const PILL_VAR: Record<RiskLevel, string> = {
  safe: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

const LABEL: Record<RiskLevel, string> = {
  safe: "An toàn",
  warning: "Cảnh báo",
  danger: "Nguy hiểm",
};

export function RiskPanel({ result }: { result: ScenarioResult }) {
  const { risk } = result;

  return (
    <div className="a-card p-5 space-y-6">
      <h3 className="t-eyebrow text-text-muted">3 điều kiện tiên quyết</h3>

      <Row
        title="Tỷ lệ khỏa lấp nợ (DCR)"
        valueLabel={formatPercent(risk.debtCoverageRatio, 0)}
        level={risk.debtCoverageLevel}
        hint="Tiền thuê thuần / khoản trả góp tháng đầu. An toàn ≥ 80%, nguy hiểm < 50%."
      />
      <Row
        title="Spread tăng giá vs lãi vay"
        valueLabel={formatPercent(risk.appreciationVsInterestSpread, 1)}
        level={risk.spreadLevel}
        hint="Tăng giá phải vượt lãi vay để đòn bẩy tạo giá trị."
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="t-control-strong text-text">P/I (Giá / Thu nhập năm)</span>
          <span
            className="font-mono font-semibold text-text"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {risk.priceToIncomeRatio.toFixed(1)}x
          </span>
        </div>
        <div className="t-meta text-text-dim">
          VN trung bình {PI_RATIO_VN}, toàn cầu {PI_RATIO_GLOBAL}.
        </div>
      </div>

      <div>
        <div className="t-eyebrow text-text-muted mb-3">Stress test trống nhà</div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--divider)" }}
        >
          {risk.vacancyStress.map((s, i) => (
            <div
              key={s.vacantMonths}
              className="flex justify-between items-center px-4 py-2.5"
              style={{
                borderTop: i > 0 ? "1px solid var(--divider)" : undefined,
              }}
            >
              <span className="t-control text-text-dim">
                Trống thêm {s.vacantMonths} tháng
              </span>
              <span
                className="font-mono font-medium text-text"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                +{formatVND(s.extraInjection)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {risk.warnings.length > 0 && (
        <div>
          <div className="t-eyebrow text-text-muted mb-3">Cảnh báo</div>
          <ul className="space-y-2">
            {risk.warnings.map((w, i) => (
              <li
                key={i}
                className="rounded-xl px-4 py-3 t-control text-text"
                style={{
                  background:
                    "color-mix(in srgb, var(--warning) 12%, var(--surface))",
                  border:
                    "1px solid color-mix(in srgb, var(--warning) 30%, var(--divider))",
                }}
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Row({
  title,
  valueLabel,
  level,
  hint,
}: {
  title: string;
  valueLabel: string;
  level: RiskLevel;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="t-control-strong text-text">{title}</span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-semibold text-text"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {valueLabel}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 9999,
              background: `color-mix(in srgb, ${PILL_VAR[level]} 14%, transparent)`,
              color: PILL_VAR[level],
            }}
          >
            {LABEL[level]}
          </span>
        </div>
      </div>
      <div className="t-meta text-text-dim">{hint}</div>
    </div>
  );
}
