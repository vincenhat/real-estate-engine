"use client";

import { useMemo, useState } from "react";
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
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const result = useMemo(() => simulate(input), [input]);

  const loadPreset = (key: PresetKey) => {
    setInput(PRESETS[key].input);
    setMobilePanelOpen(false);
  };
  const reset = () => {
    clearPersistedScenario();
    setInput(PRESETS.synergy3B.input);
  };

  return (
    <main className="min-h-screen bg-bg">
      <header
        className="sticky top-0 z-20 px-4 lg:px-10 py-3 flex items-center justify-between gap-2 flex-wrap"
        style={{
          background: "color-mix(in srgb, var(--bg) 80%, transparent)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid var(--divider)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="t-eyebrow text-text-dim truncate">Real Estate Engine</span>
          <span className="t-meta text-text-muted hidden sm:inline">v0.1</span>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Hero - typography responsive */}
      <section className="px-4 lg:px-10 pt-8 lg:pt-20 pb-6 lg:pb-14 max-w-5xl">
        <h1 className="text-text font-semibold leading-[1.08] tracking-tight"
            style={{ fontSize: "clamp(28px, 6vw, 48px)", letterSpacing: "-0.02em" }}>
          Mô phỏng đầu tư bất động sản.
          <br />
          <span className="text-text-dim">Đòn bẩy, dòng tiền, rủi ro.</span>
        </h1>
        <p className="t-body text-text-dim mt-4 lg:mt-5 max-w-2xl">
          Engine tính toán dựa trên báo cáo phân tích cơ chế lợi nhuận BĐS Việt
          Nam. Benchmark CBRE, Savills, Batdongsan, VARS, BIDV — bối cảnh
          2024–2025.
        </p>
      </section>

      {/* Mobile: input panel toggle button.  Desktop: hidden, sidebar always visible. */}
      <div className="lg:hidden px-4 pb-4 sticky top-[57px] z-10">
        <button
          onClick={() => setMobilePanelOpen((v) => !v)}
          className="a-btn a-btn-primary w-full !rounded-xl t-control-strong"
          aria-expanded={mobilePanelOpen}
        >
          {mobilePanelOpen ? "Đóng tham số" : "Chỉnh tham số kịch bản"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 lg:gap-8 px-4 lg:px-10 pb-12">
        {/* Sidebar */}
        <aside
          className={`a-card self-start lg:sticky lg:top-[80px] ${mobilePanelOpen ? "block" : "hidden lg:block"}`}
        >
          <div className="p-5 lg:p-6">
            <InputPanel
              input={input}
              onChange={setInput}
              onLoadPreset={loadPreset}
            />
          </div>
        </aside>

        <section className="space-y-6 lg:space-y-8 min-w-0">
          <KpiCards result={result} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <ProjectionChart result={result} />
            <CashFlowChart result={result} />
          </div>

          <SensitivityChart scenario={input} />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 lg:gap-6">
            <YearlyTable result={result} />
            <RiskPanel result={result} />
          </div>
        </section>
      </div>

      <footer
        className="px-4 lg:px-10 py-6 lg:py-8 t-meta text-text-muted"
        style={{ borderTop: "1px solid var(--divider)" }}
      >
        Benchmark dữ liệu: CBRE, Savills, Batdongsan.com.vn, VARS, BIDV
        (2024–2025). Aesthetic inspiration only — not affiliated with Apple Inc.
      </footer>
    </main>
  );
}
