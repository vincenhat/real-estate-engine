/**
 * Loan amortization theo dư nợ giảm dần (annuity / equal monthly payment).
 *
 * Đây là hình thức phổ biến nhất ở các ngân hàng VN cho vay mua nhà.
 */

export interface AmortizationSchedule {
  monthlyPayment: number;
  /** Dư nợ tại cuối mỗi năm, độ dài = termYears */
  balanceByYear: number[];
  /** Tổng trả nợ (gốc + lãi) trong từng năm */
  paidByYear: number[];
}

/**
 * Tính lịch trả nợ theo phương pháp niên kim (PMT cố định).
 *
 * @param principal Số tiền vay ban đầu (VNĐ)
 * @param annualRate Lãi suất danh nghĩa /năm (decimal)
 * @param termYears Kỳ hạn (năm)
 */
export function amortize(
  principal: number,
  annualRate: number,
  termYears: number,
): AmortizationSchedule {
  const months = termYears * 12;
  const r = annualRate / 12;

  // Edge case: lãi suất 0
  const monthlyPayment =
    r === 0
      ? principal / months
      : (principal * r) / (1 - Math.pow(1 + r, -months));

  const balanceByYear: number[] = [];
  const paidByYear: number[] = [];

  let balance = principal;
  for (let year = 1; year <= termYears; year++) {
    let yearPaid = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principalPart = monthlyPayment - interest;
      balance -= principalPart;
      yearPaid += monthlyPayment;
    }
    // Tránh sai số floating khiến balance < 0
    if (balance < 0.01) balance = 0;
    balanceByYear.push(balance);
    paidByYear.push(yearPaid);
  }

  return { monthlyPayment, balanceByYear, paidByYear };
}
