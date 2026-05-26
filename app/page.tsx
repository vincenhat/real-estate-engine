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
      <header className="border-b-2 border-border bg-surface px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            REAL ESTATE ENGINE
          </h1>
          <p className="text-sm font-medium text-text-dim mt-1">
            Mô phỏng đòn bẩy, dòng tiền & rủi ro cho đầu tư BĐS Việt Nam
          </p>
        </div>
        <button
          onClick={reset}
          className="brut-btn text-xs uppercase tracking-wider"
          title="Xóa dữ liệu đã lưu và quay về kịch bản mặc định"
        >
          Reset
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 p-6 lg:p-8">
        <aside className="brut-card-lg p-5">
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

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            <YearlyTable result={result} />
            <RiskPanel result={result} />
          </div>
        </section>
      </div>

      <footer className="border-t-2 border-border bg-surface px-6 py-5 text-xs font-medium text-text-dim">
        Benchmark: CBRE, Savills, Batdongsan.com.vn, VARS, BIDV (2024-2025).
        Engine logic: báo cáo phân tích cơ chế lợi nhuận BĐS Việt Nam.
      </footer>
    </main>
  );
}
