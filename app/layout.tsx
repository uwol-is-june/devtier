import type { Metadata } from "next";
import "./globals.css";
import { version } from "@/package.json";

export const metadata: Metadata = {
  title: "DevTier — GitHub 잔디로 측정하는 개발자 전투력",
  description: "GitHub 잔디(contribution) 데이터로 한국 개발자 전투력을 측정하고 티어를 부여합니다. GitHub README에 뱃지를 달아 실력을 증명하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="text-center py-4 text-[10px] text-[#484f58]">
          v{version}
        </footer>
      </body>
    </html>
  );
}
