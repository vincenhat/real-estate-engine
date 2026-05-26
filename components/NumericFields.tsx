"use client";

import { useState, useEffect, useId, useRef } from "react";

/**
 * Input fields cho engine — Vercel minimalism style.
 *
 * Cùng pattern như trước:
 *  - MoneyField: input số thuần, tách draft/value
 *  - PercentField: lưu decimal 0..1, hiển thị %
 *  - IntField: số nguyên có clamp
 *  - lastEmittedRef phân biệt echo vs external update
 */

function roundClean(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  const decimals = (step.toString().split(".")[1] || "").length;
  return Number(value.toFixed(decimals));
}

function parseDecimal(s: string): number | null {
  const normalized = s.replace(",", ".").replace(/[^\d.\-]/g, "");
  if (normalized === "" || normalized === "-" || normalized === ".") return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

interface FieldShellProps {
  label: string;
  hint?: string;
  suffix?: string;
  children: React.ReactNode;
}

function FieldShell({ label, hint, suffix, children }: FieldShellProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-mono-label text-text-dim">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex-1">{children}</div>
        {suffix && (
          <span className="t-mono-label text-text-muted min-w-[36px]">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="t-caption text-text-muted">{hint}</span>}
    </label>
  );
}

/* ─── Money (VND, không format) ───────────────────────────────────── */

export function MoneyField({
  label,
  value,
  onChange,
  hint,
  step = 1_000_000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  step?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState(() => String(value));
  const lastEmittedRef = useRef<number>(value);

  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value;
      setDraft(String(value));
    }
  }, [value]);

  return (
    <FieldShell label={label} hint={hint} suffix="VNĐ">
      <input
        id={id}
        type="number"
        step={step}
        value={draft}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          if (raw === "") {
            if (lastEmittedRef.current !== 0) {
              lastEmittedRef.current = 0;
              onChange(0);
            }
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n) && n !== lastEmittedRef.current) {
            lastEmittedRef.current = n;
            onChange(n);
          }
        }}
        onBlur={() => {
          if (draft === "") setDraft("0");
        }}
        className="v-input"
      />
    </FieldShell>
  );
}

/* ─── Percent ─────────────────────────────────────────────────────── */

export function PercentField({
  label,
  value,
  onChange,
  step = 0.1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  const id = useId();
  const toDisplay = (v: number) => roundClean(v * 100, step);

  const [draft, setDraft] = useState(() => String(toDisplay(value)));
  const lastEmittedRef = useRef<number>(value);

  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value;
      setDraft(String(toDisplay(value)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, step]);

  return (
    <FieldShell label={label} hint={hint} suffix="%">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const parsed = parseDecimal(raw);
          if (parsed !== null) {
            const next = roundClean(parsed, step) / 100;
            if (next !== lastEmittedRef.current) {
              lastEmittedRef.current = next;
              onChange(next);
            }
          } else if (raw === "") {
            if (lastEmittedRef.current !== 0) {
              lastEmittedRef.current = 0;
              onChange(0);
            }
          }
        }}
        onBlur={() => {
          const parsed = parseDecimal(draft);
          if (parsed === null) {
            setDraft(String(toDisplay(value)));
            return;
          }
          const cleaned = roundClean(parsed, step);
          setDraft(String(cleaned));
          const next = cleaned / 100;
          if (next !== lastEmittedRef.current) {
            lastEmittedRef.current = next;
            onChange(next);
          }
        }}
        className="v-input"
      />
    </FieldShell>
  );
}

/* ─── Int ─────────────────────────────────────────────────────────── */

export function IntField({
  label,
  value,
  onChange,
  suffix = "năm",
  hint,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
  min?: number;
  max?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState(() => String(value));
  const lastEmittedRef = useRef<number>(value);

  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value;
      setDraft(String(value));
    }
  }, [value]);

  return (
    <FieldShell label={label} hint={hint} suffix={suffix}>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={draft}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          if (raw === "") return;
          const n = Number(raw);
          if (!Number.isFinite(n)) return;
          const clamped = Math.max(min, Math.min(max, Math.round(n)));
          if (clamped !== lastEmittedRef.current) {
            lastEmittedRef.current = clamped;
            onChange(clamped);
          }
        }}
        onBlur={() => {
          if (draft === "" || !Number.isFinite(Number(draft))) {
            setDraft(String(value));
            return;
          }
          const clamped = Math.max(min, Math.min(max, Math.round(Number(draft))));
          setDraft(String(clamped));
          if (clamped !== lastEmittedRef.current) {
            lastEmittedRef.current = clamped;
            onChange(clamped);
          }
        }}
        className="v-input"
      />
    </FieldShell>
  );
}
