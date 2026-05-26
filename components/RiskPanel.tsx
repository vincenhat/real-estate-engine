"use client";

import type { ScenarioResult, RiskLevel } from "@/engine";
import { formatPercent, formatVND, PI_RATIO_GLOBAL, PI_RATIO_VN } from "@/engine";

const TONE: Record<RiskLevel, string> = {
  safe: "bg-success text-card",
  warning: "bg-warning text-card",
  danger: "bg-danger text-card",
};

const LABEL: Record<RiskLevel, string> = {
  safe: "AN TOÀN",
  warning: "CẢNH BÁO",
  danger: "NGUY HIỂM",
};

export function RiskPanel({ result }: { result: ScenarioResult }) {
  const { risk } = result;

  return (
    <div className="brut-card p-4 space-y-5">
      <h3 className="text-xs font-black uppercase tracking-widest pb-2 border-b-2 border-border">
        3 điều kiện tiên quyết
      </h3>

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
          <span className="font-bold">P/I (Giá / Thu nhập năm)</span>
          <span className="font-black font-mono">
            {risk.priceToIncomeRatio.toFixed(1)}x
          </span>
        </div>
        <div className="text-[11px] text-text-dim">
          VN trung bình {PI_RATIO_VN}, toàn cầu {PI_RATIO_GLOBAL}.
        </div>
      </div>

      <div>
        <div className="text-xs font-black uppercase tracking-widest mb-2">
          Stress test trống nhà
        </div>
        <div className="border-2 border-border">
          {risk.vacancyStress.map((s, i) => (
            <div
              key={s.vacantMonths}
              className={`flex justify-between items-center px-3 py-2 text-xs ${i > 0 ? "border-t-2 border-border" : ""}`}
            >
              <span className="font-medium">
                Trống thêm {s.vacantMonths} tháng
              </span>
              <span className="font-mono font-bold">
                +{formatVND(s.extraInjection)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {risk.warnings.length > 0 && (
        <div>
          <div className="text-xs font-black uppercase tracking-widest mb-2 text-danger">
            Cảnh báo
          </div>
          <ul className="space-y-2">
            {risk.warnings.map((w, i) => (
              <li
                key={i}
                className="bg-warning text-card border-2 border-border px-3 py-2 text-xs font-medium"
                style={{ boxShadow: "3px 3px 0 #1c293c" }}
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
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-bold">{title}</span>
        <div className="flex items-center gap-2">
          <span className="font-black font-mono">{valueLabel}</span>
          <span
            className={`text-[10px] font-black tracking-widest px-2 py-1 border-2 border-border ${TONE[level]}`}
          >
            {LABEL[level]}
          </span>
        </div>
      </div>
      <div className="text-[11px] text-text-dim">{hint}</div>
    </div>
  );
}
