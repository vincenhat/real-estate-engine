"use client";

import type { ScenarioResult, RiskLevel } from "@/engine";
import { formatPercent, formatVND, PI_RATIO_GLOBAL, PI_RATIO_VN } from "@/engine";

const PILL_TONE: Record<RiskLevel, { bg: string; text: string }> = {
  safe: { bg: "#ecfdf5", text: "#16a34a" },
  warning: { bg: "#fffbeb", text: "#d97706" },
  danger: { bg: "#fef2f2", text: "#dc2626" },
};

const LABEL: Record<RiskLevel, string> = {
  safe: "Safe",
  warning: "Warn",
  danger: "Danger",
};

export function RiskPanel({ result }: { result: ScenarioResult }) {
  const { risk } = result;

  return (
    <div className="v-card p-5 space-y-6">
      <h3 className="t-mono-label text-text-muted">3 điều kiện tiên quyết</h3>

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
          <span className="t-body-semibold">P/I (Giá / Thu nhập năm)</span>
          <span className="font-mono font-semibold text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
            {risk.priceToIncomeRatio.toFixed(1)}x
          </span>
        </div>
        <div className="t-caption text-text-muted">
          VN trung bình {PI_RATIO_VN}, toàn cầu {PI_RATIO_GLOBAL}.
        </div>
      </div>

      <div>
        <div className="t-mono-label text-text-muted mb-3">
          Stress test trống nhà
        </div>
        <div className="rounded-md shadow-ring overflow-hidden">
          {risk.vacancyStress.map((s, i) => (
            <div
              key={s.vacantMonths}
              className="flex justify-between items-center px-4 py-2.5"
              style={{
                boxShadow:
                  i > 0 ? "rgb(235, 235, 235) 0px 1px 0px 0px inset" : undefined,
              }}
            >
              <span className="t-small text-text-dim">
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
          <div className="t-mono-label text-text-muted mb-3">Cảnh báo</div>
          <ul className="space-y-2">
            {risk.warnings.map((w, i) => (
              <li
                key={i}
                className="rounded-md px-3 py-2.5 t-small text-text"
                style={{
                  background: "#fffbeb",
                  boxShadow: "#fde68a 0px 0px 0px 1px",
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
  const tone = PILL_TONE[level];
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="t-body-semibold">{title}</span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-semibold text-text"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {valueLabel}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "2px 8px",
              borderRadius: 9999,
              background: tone.bg,
              color: tone.text,
            }}
          >
            {LABEL[level]}
          </span>
        </div>
      </div>
      <div className="t-caption text-text-muted">{hint}</div>
    </div>
  );
}
