"use client";

import type { ScenarioInput, Segment } from "@/engine";
import { SEGMENT_BENCHMARKS } from "@/engine";
import { PRESETS, type PresetKey } from "@/engine/presets";

interface Props {
  input: ScenarioInput;
  onChange: (next: ScenarioInput) => void;
  onLoadPreset: (key: PresetKey) => void;
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-text-dim">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded bg-surface-2 border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
        />
        {suffix && <span className="text-xs text-text-dim">{suffix}</span>}
      </div>
      {hint && <span className="text-[11px] text-text-dim/70">{hint}</span>}
    </label>
  );
}

export function InputPanel({ input, onChange, onLoadPreset }: Props) {
  const update = <K extends keyof ScenarioInput>(
    key: K,
    value: ScenarioInput[K],
  ) => onChange({ ...input, [key]: value });

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <div className="text-xs uppercase tracking-wide text-text-dim mb-2">
          Kịch bản mẫu
        </div>
        <div className="flex flex-col gap-2">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onLoadPreset(key)}
              className="text-left text-sm px-3 py-2 rounded bg-surface-2 border border-border hover:border-accent transition-colors"
            >
              {PRESETS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tài sản */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-accent">Tài sản</h3>
        <div className="space-y-3">
          <NumberField
            label="Giá mua"
            value={input.property.price}
            onChange={(v) =>
              update("property", { ...input.property, price: v })
            }
            step={100_000_000}
            suffix="VNĐ"
          />
          <label className="flex flex-col gap-1">
            <span className="text-xs text-text-dim">Phân khúc</span>
            <select
              value={input.property.segment}
              onChange={(e) =>
                update("property", {
                  ...input.property,
                  segment: e.target.value as Segment,
                })
              }
              className="w-full rounded bg-surface-2 border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {(Object.keys(SEGMENT_BENCHMARKS) as Segment[]).map((seg) => (
                <option key={seg} value={seg}>
                  {SEGMENT_BENCHMARKS[seg].label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Khoản vay */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-accent">Khoản vay</h3>
        <div className="space-y-3">
          <NumberField
            label="Tỷ lệ vốn tự có"
            value={input.loan.equityRatio * 100}
            onChange={(v) =>
              update("loan", { ...input.loan, equityRatio: v / 100 })
            }
            suffix="%"
            hint="Phần còn lại sẽ vay ngân hàng"
          />
          <NumberField
            label="Lãi suất vay"
            value={input.loan.interestRate * 100}
            onChange={(v) =>
              update("loan", { ...input.loan, interestRate: v / 100 })
            }
            step={0.1}
            suffix="%/năm"
          />
          <NumberField
            label="Kỳ hạn"
            value={input.loan.termYears}
            onChange={(v) => update("loan", { ...input.loan, termYears: v })}
            suffix="năm"
          />
        </div>
      </section>

      {/* Cho thuê */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-accent">Cho thuê</h3>
        <div className="space-y-3">
          <NumberField
            label="Tiền thuê hàng tháng"
            value={input.rental.monthlyRent}
            onChange={(v) =>
              update("rental", { ...input.rental, monthlyRent: v })
            }
            step={500_000}
            suffix="VNĐ/tháng"
          />
          <NumberField
            label="Chi phí vận hành"
            value={input.rental.operatingExpenseRatio * 100}
            onChange={(v) =>
              update("rental", {
                ...input.rental,
                operatingExpenseRatio: v / 100,
              })
            }
            suffix="% tiền thuê"
            hint="Phí QL, sửa chữa, thuế"
          />
          <NumberField
            label="Tỷ lệ trống nhà"
            value={input.rental.vacancyRate * 100}
            onChange={(v) =>
              update("rental", { ...input.rental, vacancyRate: v / 100 })
            }
            suffix="%"
            hint="8% ≈ 1 tháng trống/năm"
          />
        </div>
      </section>

      {/* Thị trường */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-accent">Giả định thị trường</h3>
        <div className="space-y-3">
          <NumberField
            label="Tốc độ tăng giá tài sản"
            value={input.market.appreciationRate * 100}
            onChange={(v) =>
              update("market", { ...input.market, appreciationRate: v / 100 })
            }
            step={0.5}
            suffix="%/năm"
          />
          <NumberField
            label="Tốc độ tăng tiền thuê"
            value={input.market.rentGrowthRate * 100}
            onChange={(v) =>
              update("market", { ...input.market, rentGrowthRate: v / 100 })
            }
            step={0.5}
            suffix="%/năm"
          />
          <NumberField
            label="Lãi tiết kiệm tham chiếu"
            value={input.market.savingsRate * 100}
            onChange={(v) =>
              update("market", { ...input.market, savingsRate: v / 100 })
            }
            step={0.1}
            suffix="%/năm"
          />
          <NumberField
            label="Thu nhập hộ gia đình"
            value={input.market.householdAnnualIncome}
            onChange={(v) =>
              update("market", { ...input.market, householdAnnualIncome: v })
            }
            step={20_000_000}
            suffix="VNĐ/năm"
            hint="Để tính tỷ lệ Giá/Thu nhập"
          />
          <NumberField
            label="Thời gian nắm giữ"
            value={input.holdingYears}
            onChange={(v) => update("holdingYears", v)}
            suffix="năm"
          />
        </div>
      </section>
    </div>
  );
}
