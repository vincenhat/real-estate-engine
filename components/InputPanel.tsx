"use client";

import type { ScenarioInput, Segment } from "@/engine";
import { SEGMENT_BENCHMARKS } from "@/engine";
import { PRESETS, type PresetKey } from "@/engine/presets";
import { MoneyField, PercentField, IntField } from "./NumericFields";

interface Props {
  input: ScenarioInput;
  onChange: (next: ScenarioInput) => void;
  onLoadPreset: (key: PresetKey) => void;
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
          <MoneyField
            label="Giá mua"
            value={input.property.price}
            onChange={(v) => update("property", { ...input.property, price: v })}
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
          <PercentField
            label="Tỷ lệ vốn tự có"
            value={input.loan.equityRatio}
            onChange={(v) => update("loan", { ...input.loan, equityRatio: v })}
            step={1}
            hint="Phần còn lại sẽ vay ngân hàng"
          />
          <PercentField
            label="Lãi suất vay"
            value={input.loan.interestRate}
            onChange={(v) => update("loan", { ...input.loan, interestRate: v })}
            step={0.1}
          />
          <IntField
            label="Kỳ hạn"
            value={input.loan.termYears}
            onChange={(v) => update("loan", { ...input.loan, termYears: v })}
            min={1}
            max={40}
          />
        </div>
      </section>

      {/* Cho thuê */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-accent">Cho thuê</h3>
        <div className="space-y-3">
          <MoneyField
            label="Tiền thuê hàng tháng"
            value={input.rental.monthlyRent}
            onChange={(v) => update("rental", { ...input.rental, monthlyRent: v })}
          />
          <PercentField
            label="Chi phí vận hành"
            value={input.rental.operatingExpenseRatio}
            onChange={(v) =>
              update("rental", { ...input.rental, operatingExpenseRatio: v })
            }
            step={1}
            hint="% của tiền thuê. Phí QL, sửa chữa, thuế."
          />
          <PercentField
            label="Tỷ lệ trống nhà"
            value={input.rental.vacancyRate}
            onChange={(v) =>
              update("rental", { ...input.rental, vacancyRate: v })
            }
            step={1}
            hint="8% ≈ 1 tháng trống/năm"
          />
        </div>
      </section>

      {/* Thị trường */}
      <section>
        <h3 className="text-sm font-semibold mb-3 text-accent">
          Giả định thị trường
        </h3>
        <div className="space-y-3">
          <PercentField
            label="Tốc độ tăng giá tài sản"
            value={input.market.appreciationRate}
            onChange={(v) =>
              update("market", { ...input.market, appreciationRate: v })
            }
            step={0.5}
          />
          <PercentField
            label="Tốc độ tăng tiền thuê"
            value={input.market.rentGrowthRate}
            onChange={(v) =>
              update("market", { ...input.market, rentGrowthRate: v })
            }
            step={0.5}
          />
          <PercentField
            label="Lãi tiết kiệm tham chiếu"
            value={input.market.savingsRate}
            onChange={(v) =>
              update("market", { ...input.market, savingsRate: v })
            }
            step={0.1}
          />
          <MoneyField
            label="Thu nhập hộ gia đình / năm"
            value={input.market.householdAnnualIncome}
            onChange={(v) =>
              update("market", { ...input.market, householdAnnualIncome: v })
            }
            hint="Để tính tỷ lệ Giá/Thu nhập"
          />
          <IntField
            label="Thời gian nắm giữ"
            value={input.holdingYears}
            onChange={(v) => update("holdingYears", v)}
            min={1}
            max={50}
          />
        </div>
      </section>
    </div>
  );
}
