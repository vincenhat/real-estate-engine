"use client";

import { useEffect, useState, useCallback } from "react";

export type ThemePref = "light" | "dark" | "system";

const KEY = "real-estate-engine:theme";

function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  const isDark =
    pref === "dark" ||
    (pref === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

/**
 * Theme hook với 3 lựa chọn: light / dark / system.
 *
 * SSR-safe: server render mặc định "light", sau hydrate đọc localStorage.
 * Inline script trong layout đã apply class "dark" trước khi React mount để
 * tránh FOUC (flash of incorrect theme).
 */
export function useTheme(): {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
} {
  const [pref, setPrefState] = useState<ThemePref>("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) as ThemePref | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        setPrefState(saved);
      }
    } catch {
      // ignore
    }

    // Theo dõi thay đổi system theme khi đang ở "system"
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current =
        (window.localStorage.getItem(KEY) as ThemePref | null) ?? "system";
      if (current === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    try {
      window.localStorage.setItem(KEY, p);
    } catch {
      // ignore
    }
    applyTheme(p);
  }, []);

  return { pref, setPref };
}
