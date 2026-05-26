"use client";

import { useEffect, useRef, useState } from "react";
import type { ScenarioInput } from "@/engine";

const STORAGE_KEY = "real-estate-engine:scenario:v1";

/**
 * Hook persist scenario vào localStorage.
 *
 * SSR-safe: server render với `defaultValue`, sau khi mount mới đọc localStorage.
 * Việc swap giá trị xảy ra trong useEffect → tránh hydration mismatch.
 *
 * Validation tối thiểu: kiểm tra shape có đủ các nhóm không, nếu thiếu fall back
 * về default. Không validate sâu để tránh phá nếu sau này thêm field mới.
 */
export function usePersistedScenario(
  defaultValue: ScenarioInput,
): [ScenarioInput, (next: ScenarioInput) => void, boolean] {
  const [scenario, setScenario] = useState<ScenarioInput>(defaultValue);
  const [hydrated, setHydrated] = useState(false);
  const skipNextWrite = useRef(true);

  // Load 1 lần sau mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidScenario(parsed)) {
          setScenario(parsed as ScenarioInput);
        }
      }
    } catch {
      // localStorage không khả dụng (private mode, quota...) → bỏ qua
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save mỗi lần scenario đổi (sau khi đã hydrated)
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
    } catch {
      // ignore
    }
  }, [scenario, hydrated]);

  return [scenario, setScenario, hydrated];
}

function isValidScenario(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.property === "object" &&
    typeof o.loan === "object" &&
    typeof o.rental === "object" &&
    typeof o.market === "object" &&
    typeof o.holdingYears === "number"
  );
}

export function clearPersistedScenario() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
