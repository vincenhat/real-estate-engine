"use client";

import { useMemo, useState } from "react";
import { simulate, type ScenarioInput } from "@/engine";
import { PRESETS, type PresetKey } from "@/engine/presets";
import { InputPanel } from "@/components/InputPanel";
import { KpiCards } from "@/components/KpiCards";
import { ProjectionChart, CashFlowChart } from "@/components/ProjectionChart";
import { YearlyTable } from "@/components/YearlyTable";
import { RiskPanel } from "@/components/RiskPanel";

export default function Home() {
  const [input, setInput] = useState<ScenarioInput>(PRESETS.synergy3B.input);

  const result = useMemo(() => simulate(input), [input]);

  const loadPreset = (key: PresetKey) => setInput(PRESETS[key].input);

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold">Real Estate Engine</h1>
        <p className="text-sm text-text-dim">
          Mô phỏng đòn bẩy, dòng tiền & rủi ro cho đầu tư BĐS Việt Nam
        </p>
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
