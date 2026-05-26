"use client";

import { useMemo } from "react";
import { simulate } from "@/engine";
import { PRESETS, type PresetKey } from "@/engine/presets";
import { InputPanel } from "@/components/InputPanel";
import { KpiCards } from "@/components/KpiCards";
import { ProjectionChart, CashFlowChart } from "@/components/ProjectionChart";
import { YearlyTable } from "@/components/YearlyTable";
import { RiskPanel } from "@/components/RiskPanel";
import { SensitivityChart } from "@/components/SensitivityChart";
import {
  usePersistedScenario,
  clearPersistedScenario,
} from "@/hooks/usePersistedScenario";

export default function Home() {
  const [input, setInput] = usePersistedScenario(PRESETS.synergy3B.input);

  const result = useMemo(() => simulate(input), [input]);

  const loadPreset = (key: PresetKey) => setInput(PRESETS[key].input);
  const reset = () => {
    clearPersistedScenario();
    setInput(PRESETS.synergy3B.input);
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Real Estate Engine</h1>
          <p className="text-sm text-text-dim">
            Mô phỏng đòn bẩy, dòng tiền & rủi ro cho đầu tư BĐS Việt Nam
          </p>
        </div>
        <button
          onClick={reset}
          className="text-xs px-3 py-1.5 rounded border border-border bg-surface-2 hover:border-accent transition-colors"
          title="Xóa dữ liệu đã lưu và quay về kịch bản mặc định"
        >
          Reset
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 p-6">
        <aside className="rounded-lg border border-border bg-surface p-4">
          <InputPanel
            input={input}
            onChange={setInput}
            onLoadPreset={loadPreset}
          />
        </aside>

        <section className="space-y-6">
          <KpiCards result={result} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProjectionChart result={result} />
            <CashFlowChart result={result} />
          </div>

          <SensitivityChart scenario={input} />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <YearlyTable result={result} />
            <RiskPanel result={result} />
          </div>
        </section>
      </div>

      <footer className="px-6 py-6 text-xs text-text-dim border-t border-border">
        Benchmark dữ liệu: CBRE, Savills, Batdongsan.com.vn, VARS, BIDV (2024-2025).
        Engine logic dựa trên báo cáo phân tích cơ chế lợi nhuận BĐS Việt Nam.
      </footer>
    </main>
  );
}
