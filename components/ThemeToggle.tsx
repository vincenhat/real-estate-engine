"use client";

import { useTheme, type ThemePref } from "@/hooks/useTheme";

const OPTIONS: { value: ThemePref; label: string; icon: string }[] = [
  { value: "light", label: "Sáng", icon: "☀" },
  { value: "system", label: "Tự động", icon: "◐" },
  { value: "dark", label: "Tối", icon: "☾" },
];

export function ThemeToggle() {
  const { pref, setPref } = useTheme();

  return (
    <div
      className="a-segmented"
      role="group"
      aria-label="Giao diện"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={pref === o.value}
          aria-label={o.label}
          onClick={() => setPref(o.value)}
          title={o.label}
        >
          <span aria-hidden="true">{o.icon}</span>
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
