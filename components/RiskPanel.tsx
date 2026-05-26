"use client";

import type { ScenarioResult, RiskLevel } from "@/engine";
import { formatPercent, formatVND, PI_RATIO_GLOBAL, PI_RATIO_VN } from "@/engine";

const TONE: Record<RiskLevel, string> = {
  safe: "border-safe/40 bg-safe/10 text-safe",
  warning: "border-warning/40 bg-warning/10 text-warning",
  danger: "border-danger/40 bg-danger/10 text-danger",
};

const LABEL: Record<RiskLevel, string> = {
  safe: "An toàn",
  warning: "Cảnh báo",
  danger: "Nguy hiểm",
};

export function RiskPanel({ result }: { result: ScenarioResult }) {
  const { risk } = result;

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <h3 className="text-sm font-semibold">3 điều kiện tiên quyết</h3>

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
        <div className="flex items-center justify-between text-sm mb-1">
          <span>P/I (Giá nhà / Thu nhập năm)</span>
          <span className="font-semibold">
            {risk.priceToIncomeRatio.toFixed(1)}x
          </span>
        </div>
        <div className="text-[11px] text-text-dim">
          VN trung bình {PI_RATIO_VN}, toàn cầu {PI_RATIO_GLOBAL}.
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Stress test trống nhà</div>
        <div className="space-y-1 text-xs">
          {risk.vacancyStress.map((s) => (
            <div
              key={s.vacantMonths}
              className="flex justify-between border-b border-border/50 py-1"
            >
              <span className="text-text-dim">
                Trống thêm {s.vacantMonths} tháng
              </span>
              <span>+{formatVND(s.extraInjection)} bù/năm</span>
            </div>
          ))}
        </div>
      </div>

      {risk.warnings.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-warning">Cảnh báo</div>
          <ul className="space-y-1 text-xs">
            {risk.warnings.map((w, i) => (
              <li
                key={i}
                className="rounded border border-warning/30 bg-warning/5 px-2 py-1.5 text-text"
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
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{valueLabel}</span>
          <span
            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${TONE[level]}`}
          >
            {LABEL[level]}
          </span>
        </div>
      </div>
      <div className="text-[11px] text-text-dim">{hint}</div>
    </div>
  );
}
