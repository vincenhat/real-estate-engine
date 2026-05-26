import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter Tight ≈ SF Pro Display metrics. Inter for body.
const interTight = Inter_Tight({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-text",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-stack",
});

export const metadata: Metadata = {
  title: "Real Estate Engine — Mô phỏng đầu tư BĐS Việt Nam",
  description:
    "Engine tính toán đòn bẩy, dòng tiền và rủi ro cho đầu tư bất động sản tại Việt Nam.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Inline script chống FOUC: chạy đồng bộ trước khi React mount.
// Đọc localStorage và set class "dark" lên <html> ngay từ đầu.
const themeBootstrap = `
(function() {
  try {
    var p = localStorage.getItem('real-estate-engine:theme') || 'system';
    var isDark = p === 'dark' || (p === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${interTight.variable} ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
