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
 * Vấn đề cần giải quyết:
 *  - Hiển thị "1.000.000.000" thay vì "1000000000"
 *  - Khi format thêm/bớt dấu phân cách, cursor không được nhảy lung tung
 *  - Tránh bug floating: 0.07 * 100 = 7.000000000000001
 *  - Giá trị truyền lên cha luôn là number sạch (không phải string đã format)
 *
 * Cách giải cursor preservation:
 *  - Trước khi format, đếm số chữ số bên trái cursor trong chuỗi raw.
 *  - Sau khi DOM update, đặt cursor sau đúng số chữ số đó trong chuỗi mới.
 *  - Cách này độc lập với số dấu phân cách → không bị lệch khi chuỗi dài.
 */

function roundClean(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  const decimals = (step.toString().split(".")[1] || "").length;
  return Number(value.toFixed(decimals));
}

function formatThousands(n: number): string {
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n);
}

function parseThousands(s: string): number {
  const cleaned = s.replace(/[^\d-]/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  return Number(cleaned);
}

function parseDecimal(s: string): number | null {
  const normalized = s.replace(",", ".").replace(/[^\d.\-]/g, "");
  if (normalized === "" || normalized === "-" || normalized === ".") return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Đếm số chữ số trong khoảng [0, end) của chuỗi */
function countDigits(s: string, end: number): number {
  let c = 0;
  for (let i = 0; i < end && i < s.length; i++) {
    if (s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57) c++;
  }
  return c;
}

/** Tìm vị trí trong `formatted` mà có đúng `n` chữ số ở bên trái */
function cursorAfterDigits(formatted: string, n: number): number {
  if (n <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted.charCodeAt(i) >= 48 && formatted.charCodeAt(i) <= 57) {
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

/**
 * Hook giữ cursor đúng vị trí khi value của controlled input bị reformat.
 * Trả về ref + handler để gọi sau mỗi onChange.
 */
function useCursorPreserve() {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      const pos = pendingCursor.current;
      inputRef.current.setSelectionRange(pos, pos);
      pendingCursor.current = null;
    }
  });

  const schedule = (pos: number) => {
    pendingCursor.current = pos;
  };

  return { inputRef, schedule };
}

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
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatThousands(value));
  const { inputRef, schedule } = useCursorPreserve();

  useEffect(() => {
    if (!focused) setDraft(formatThousands(value));
  }, [value, focused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;
    const digitsLeft = countDigits(raw, cursor);

    const n = parseThousands(raw);
    const formatted = raw === "" ? "" : formatThousands(n);

    schedule(cursorAfterDigits(formatted, digitsLeft));
    setDraft(formatted);
    onChange(n);
  };

  return (
    <FieldShell label={label} hint={hint} suffix="VNĐ">
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const n = parseThousands(draft);
          setDraft(formatThousands(n));
          onChange(n);
        }}
        onChange={handleChange}
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
  const [focused, setFocused] = useState(false);

  const toDisplay = (v: number) => roundClean(v * 100, step);

  const [draft, setDraft] = useState(() => String(toDisplay(value)));

  useEffect(() => {
    if (!focused) setDraft(String(toDisplay(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, step]);

  return (
    <FieldShell label={label} hint={hint} suffix="%">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const parsed = parseDecimal(draft);
          if (parsed === null) {
            setDraft(String(toDisplay(value)));
            return;
          }
          const cleaned = roundClean(parsed, step);
          setDraft(String(cleaned));
          onChange(cleaned / 100);
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const parsed = parseDecimal(raw);
          if (parsed !== null) {
            onChange(roundClean(parsed, step) / 100);
          } else if (raw === "") {
            onChange(0);
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
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => String(value));

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <FieldShell label={label} hint={hint} suffix={suffix}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const parsed = parseDecimal(draft);
          const n =
            parsed === null
              ? value
              : Math.max(min, Math.min(max, Math.round(parsed)));
          setDraft(String(n));
          onChange(n);
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const parsed = parseDecimal(raw);
          if (parsed !== null) {
            onChange(Math.max(min, Math.min(max, Math.round(parsed))));
          }
        }}
        className={inputClass}
      />
    </FieldShell>
  );
}
