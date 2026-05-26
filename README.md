# Real Estate Engine

Engine mô phỏng đầu tư bất động sản tại Việt Nam, xây dựng dựa trên báo cáo phân tích cơ chế lợi nhuận và logic đầu tư BĐS VN (chu kỳ 1993-2025).

## Logic cốt lõi

Engine triển khai 4 cụm tính toán tách biệt trong `engine/`:

| Module | Tệp | Vai trò |
| --- | --- | --- |
| Loan amortization | `engine/loan.ts` | Tính lịch trả nợ niên kim, dư nợ theo năm |
| Capital gain + đòn bẩy | `engine/simulator.ts` | Mô phỏng tăng giá tài sản, ROI trên equity vs trên tổng vốn thực |
| Rental yield | `engine/simulator.ts` (`computeYields`) | Gross/net yield, so với benchmark phân khúc |
| Risk & health | `engine/simulator.ts` (`assessRisk`) | DCR, spread tăng giá vs lãi, P/I, vacancy stress, cảnh báo |
| Sensitivity | `engine/sensitivity.ts` | Sweep 1 biến (lãi vay, tăng giá, vacancy, equity, rent growth, holding) → curve ROI + breakeven |

Benchmark thị trường (CBRE, Savills, Batdongsan, VARS, BIDV) trong `engine/benchmarks.ts`.

## Kịch bản mẫu

`engine/presets.ts` có 3 preset minh họa các giai đoạn trong báo cáo:

- **golden90s**: chu kỳ vàng 2010-2022, tăng giá 12%/năm.
- **synergy3B**: ví dụ căn 3 tỷ, 5 năm, dòng tiền âm nhẹ nhưng ROI ~100% trên vốn thực.
- **stress2025**: bối cảnh 2025 với yield 2.2%, dòng tiền âm sâu.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3000
npm run test     # vitest engine
npm run typecheck
```

## Cấu trúc

```
engine/         # core logic - không phụ thuộc React, có thể import nơi khác
  types.ts
  benchmarks.ts
  loan.ts
  simulator.ts
  presets.ts
  format.ts
  simulator.test.ts

components/     # UI Recharts + Tailwind
app/            # Next.js App Router
```
