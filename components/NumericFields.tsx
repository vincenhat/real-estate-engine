"use client";

import { useState, useEffect, useId } from "react";

/**
 * Các input field tự format số.
 *
 * Vấn đề cốt lõi cần giải quyết:
 *  - Người dùng cần nhìn thấy "1.000.000.000" thay vì "1000000000"
 *  - Khi đang gõ, không được tự sắp xếp lại con trỏ làm gián đoạn nhập liệu
 *  - Giá trị truyền lên component cha phải là number sạch (không phải string đã format)
 *  - Tránh bug floating: 0.07 * 100 = 7.000000000000001 → gõ xóa không được
 *
 * Cách giải:
 *  - Mỗi field giữ một "draft" string riêng (UI state)
 *  - Khi blur hoặc parent đổi giá trị (preset load), đồng bộ lại draft
 *  - Khi đang focus, không ép format để con trỏ ở yên
 *  - roundClean() làm tròn về step để loại bỏ rác floating point
 */

function roundClean(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  // Số chữ số thập phân tối đa = số chữ số sau dấu chấm của step
  const decimals = (step.toString().split(".")[1] || "").length;
  return Number(value.toFixed(decimals));
}

function formatThousands(n: number): string {
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n);
}

function parseThousands(s: string): number {
  // Loại mọi ký tự không phải số hoặc dấu trừ
  const cleaned = s.replace(/[^\d-]/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  return Number(cleaned);
}

function parseDecimal(s: string): number | null {
  // Cho phép cả dấu chấm hoặc phẩy làm separator thập phân
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
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatThousands(value));

  // Đồng bộ khi parent thay đổi và user không đang gõ
  useEffect(() => {
    if (!focused) setDraft(formatThousands(value));
  }, [value, focused]);

  return (
    <FieldShell label={label} hint={hint} suffix="VNĐ">
      <input
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
        onChange={(e) => {
          const raw = e.target.value;
          // Cho phép user gõ tự do, nhưng tự re-format ngay sau mỗi keypress
          const n = parseThousands(raw);
          setDraft(raw === "" ? "" : formatThousands(n));
          onChange(n);
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
  const [focused, setFocused] = useState(false);

  // Quy chuẩn: ép giá trị decimal → % và làm tròn về step
  const toDisplay = (v: number) => {
    const pct = v * 100;
    return roundClean(pct, step);
  };

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
          // Update parent ngay nếu parse được, để chart phản hồi real-time
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
