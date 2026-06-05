import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "100种不可思议旅行 — 探索地球上最令人惊叹的目的地",
    template: "%s | 100种不可思议旅行",
  },
  description:
    "发现 100 个小众而震撼的旅行目的地 — 从天空之镜到地下萤火虫星河，每一条都是改变人生的旅行体验。",
  keywords: ["旅行", "目的地", "小众旅行", "自然奇观", "旅行攻略"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
