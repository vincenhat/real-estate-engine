"use client";

import { useEffect, useState } from "react";

interface ChartTokens {
  text: string;
  axis: string;
  grid: string;
  accent: string;
  link: string;
  success: string;
  warning: string;
  danger: string;
  card: string;
  divider: string;
}

const FALLBACK: ChartTokens = {
  text: "#1d1d1f",
  axis: "#86868b",
  grid: "#e5e5e7",
  accent: "#0071e3",
  link: "#0066cc",
  success: "#16a34a",
  warning: "#ca8a04",
  danger: "#d70015",
  card: "#ffffff",
  divider: "#e5e5e7",
};

function read(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * Đọc CSS variables để truyền vào Recharts (recharts không tự đọc var()).
 * Re-read khi class "dark" trên <html> đổi.
 */
export function useChartTokens(): ChartTokens {
  const [tokens, setTokens] = useState<ChartTokens>(FALLBACK);

  useEffect(() => {
    const refresh = () => {
      setTokens({
        text: read("--chart-text", FALLBACK.text),
        axis: read("--chart-axis", FALLBACK.axis),
        grid: read("--chart-grid", FALLBACK.grid),
        accent: read("--accent", FALLBACK.accent),
        link: read("--link", FALLBACK.link),
        success: read("--success", FALLBACK.success),
        warning: read("--warning", FALLBACK.warning),
        danger: read("--danger", FALLBACK.danger),
        card: read("--card", FALLBACK.card),
        divider: read("--divider", FALLBACK.divider),
      });
    };
    refresh();

    // Theo dõi class change trên <html>
    const obs = new MutationObserver(refresh);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return tokens;
}
