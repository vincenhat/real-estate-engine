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
      <header className="sticky top-0 z-10 bg-card shadow-border px-6 lg:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="t-mono-label text-text-muted">v0.1</span>
          <h1 className="t-card-title">Real Estate Engine</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="v-pill">VN · 2024–2025</span>
          <button onClick={reset} className="v-btn" title="Xóa dữ liệu đã lưu">
            Reset
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-10 pt-8 pb-4">
        <p className="t-small text-text-dim max-w-2xl">
          Mô phỏng đòn bẩy, dòng tiền và rủi ro cho đầu tư bất động sản tại
          Việt Nam. Logic tính toán dựa trên báo cáo phân tích cơ chế lợi nhuận
          BĐS VN, benchmark CBRE / Savills / Batdongsan / VARS / BIDV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 px-6 lg:px-10 pb-10">
        <aside className="v-card p-5 self-start lg:sticky lg:top-[88px]">
          <InputPanel
            input={input}
            onChange={setInput}
            onLoadPreset={loadPreset}
          />
        </aside>

        <section className="space-y-8">
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

      <footer className="shadow-border px-6 lg:px-10 py-6 t-caption text-text-muted">
        Benchmark dữ liệu: CBRE, Savills, Batdongsan.com.vn, VARS, BIDV (2024–2025).
        Aesthetic inspiration only — not affiliated with Vercel.
      </footer>
    </main>
  );
}
