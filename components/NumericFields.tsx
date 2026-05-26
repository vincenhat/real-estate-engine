"use client";

import {
  useState,
  useEffect,
  useId,
  useRef,
  useLayoutEffect,
  type ChangeEvent,
} from "react";

/**
 * Các input field tự format số.
 *
 * Vấn đề cốt lõi:
 *  - Hiển thị "1.000.000.000" thay vì "1000000000"
 *  - Khi format thêm/bớt dấu phân cách, cursor không nhảy
 *  - Tránh bug floating: 0.07 * 100 = 7.000000000000001
 *  - Giá trị truyền lên cha luôn là number sạch
 *  - Không bị "đè" bởi value prop từ cha sau onChange
 *
 * Cách giải:
 *  - Format thủ công (không phụ thuộc Intl locale, vì vi-VN không nhất quán
 *    giữa Chrome/Firefox/Safari/Node).
 *  - Sync draft từ value prop CHỈ khi value đến từ NGUỒN BÊN NGOÀI (preset
 *    load, reset). Cách phát hiện: so với giá trị cuối ta tự gửi lên cha.
 *    Không dựa vào `focused` vì có thể không tin được trên mobile.
 *  - Cursor preservation: đếm số chữ số bên trái cursor → đặt lại sau format.
 */

/** Format số nguyên với dấu chấm phân cách hàng nghìn (chuẩn VN). */
function formatThousands(n: number): string {
  if (!Number.isFinite(n)) return "";
  const sign = n < 0 ? "-" : "";
  const digits = Math.abs(Math.trunc(n)).toString();
  // Chèn "." mỗi 3 chữ số từ phải sang
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return sign + grouped;
}

function parseThousands(s: string): number {
  const cleaned = s.replace(/[^\d-]/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return 0;
  // Clamp về safe integer để tránh hành vi lạ với số quá lớn
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(-Number.MAX_SAFE_INTEGER, n));
}

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

function countDigits(s: string, end: number): number {
  let c = 0;
  const limit = Math.min(end, s.length);
  for (let i = 0; i < limit; i++) {
    const code = s.charCodeAt(i);
    if (code >= 48 && code <= 57) c++;
  }
  return c;
}

function cursorAfterDigits(formatted: string, n: number): number {
  if (n <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    const code = formatted.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      count++;
      if (count === n) return i + 1;
    }
  }
  return formatted.length;
}

interface FieldShellProps {
  label: string;
  hint?: string;
  suffix?: string;
  children: React.ReactNode;
}

function FieldShell({ label, hint, suffix, children }: FieldShellProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-text-dim">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex-1">{children}</div>
        {suffix && <span className="text-xs text-text-dim">{suffix}</span>}
      </div>
      {hint && <span className="text-[11px] text-text-dim/70">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded bg-surface-2 border border-border px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:border-accent";

/* ─── Money (VND, separator hàng nghìn) ───────────────────────────── */

export function MoneyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState(() => formatThousands(value));
  const lastEmittedRef = useRef<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  // Cursor restore sau mỗi render có pending cursor
  useLayoutEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      const pos = pendingCursor.current;
      try {
        inputRef.current.setSelectionRange(pos, pos);
      } catch {
        // Một số trình duyệt không cho phép setSelectionRange trên type=text
        // sau khi blur, bỏ qua nếu fail.
      }
      pendingCursor.current = null;
    }
  });

  // Sync draft từ value prop CHỈ khi value đến từ nguồn ngoài (preset/reset).
  // Phát hiện bằng cách so với giá trị cuối ta đã gửi lên cha.
  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value;
      setDraft(formatThousands(value));
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;
    const digitsLeft = countDigits(raw, cursor);

    const n = parseThousands(raw);
    const formatted = raw === "" ? "" : formatThousands(n);

    pendingCursor.current = cursorAfterDigits(formatted, digitsLeft);
    setDraft(formatted);

    if (n !== lastEmittedRef.current) {
      lastEmittedRef.current = n;
      onChange(n);
    }
  };

  return (
    <FieldShell label={label} hint={hint} suffix="VNĐ">
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={handleChange}
        onBlur={() => {
          // Đồng bộ format chuẩn lúc blur (vd. user gõ 005 → 5)
          const n = parseThousands(draft);
          setDraft(formatThousands(n));
          if (n !== lastEmittedRef.current) {
            lastEmittedRef.current = n;
            onChange(n);
          }
        }}
        className={inputClass}
      />
    </FieldShell>
  );
}

/* ─── Percent (lưu trữ decimal 0..1, hiển thị %) ──────────────────── */

export function PercentField({
  label,
  value,
  onChange,
  step = 0.1,
  hint,
}: {
  label: string;
  /** Decimal 0..1 - vd. 0.07 nghĩa là 7% */
  value: number;
  onChange: (v: number) => void;
  /** Step tính theo % (1 = 1%, 0.1 = 0.1%) */
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
        className={inputClass}
      />
    </FieldShell>
  );
}

/* ─── Số nguyên (vd. số năm) ──────────────────────────────────────── */

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
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const parsed = parseDecimal(raw);
          if (parsed !== null) {
            const clamped = Math.max(min, Math.min(max, Math.round(parsed)));
            if (clamped !== lastEmittedRef.current) {
              lastEmittedRef.current = clamped;
              onChange(clamped);
            }
          }
        }}
        onBlur={() => {
          const parsed = parseDecimal(draft);
          const n =
            parsed === null
              ? value
              : Math.max(min, Math.min(max, Math.round(parsed)));
          setDraft(String(n));
          if (n !== lastEmittedRef.current) {
            lastEmittedRef.current = n;
            onChange(n);
          }
        }}
        className={inputClass}
      />
    </FieldShell>
  );
}
