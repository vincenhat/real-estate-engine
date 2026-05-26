import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Estate Engine - Mô phỏng đầu tư BĐS Việt Nam",
  description:
    "Engine tính toán đòn bẩy, dòng tiền và rủi ro cho đầu tư bất động sản tại Việt Nam.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
