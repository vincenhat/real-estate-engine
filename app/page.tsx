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
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <main className="min-h-screen bg-bg">
      <header
        className="sticky top-0 z-10 px-6 lg:px-10 py-3.5 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: "color-mix(in srgb, var(--bg) 80%, transparent)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid var(--divider)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="t-eyebrow text-text-dim">Real Estate Engine</span>
          <span className="t-meta text-text-muted">v0.1</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={reset}
            className="a-btn t-control"
            title="Xóa dữ liệu đã lưu"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 lg:px-10 pt-12 lg:pt-20 pb-10 lg:pb-14 max-w-5xl">
        <h1 className="t-hero text-text">
          Mô phỏng đầu tư bất động sản.
          <br />
          <span className="text-text-dim">Đòn bẩy, dòng tiền, rủi ro.</span>
        </h1>
        <p className="t-body text-text-dim mt-5 max-w-2xl">
          Engine tính toán dựa trên báo cáo phân tích cơ chế lợi nhuận BĐS Việt
          Nam. Benchmark CBRE, Savills, Batdongsan, VARS, BIDV — cập nhật bối
          cảnh 2024–2025.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 px-6 lg:px-10 pb-16">
        <aside className="a-card p-6 self-start lg:sticky lg:top-[80px]">
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

      <footer
        className="px-6 lg:px-10 py-8 t-meta text-text-muted"
        style={{ borderTop: "1px solid var(--divider)" }}
      >
        Benchmark dữ liệu: CBRE, Savills, Batdongsan.com.vn, VARS, BIDV
        (2024–2025). Aesthetic inspiration only — not affiliated with Apple Inc.
      </footer>
    </main>
  );
}
