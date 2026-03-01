import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-main",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | FORTE CUP",
    default: "FORTE CUP — Бумажные стаканы оптом",
  },
  description:
    "Дизайнерская одноразовая посуда для дерзких кофеен. Двухслойные стаканы, эко-материалы и кастомная печать.",
  keywords: ["бумажные стаканы", "forte cup", "оптом", "двухслойные", "москва"],
  openGraph: {
    title: "FORTE CUP — Бумажные стаканы оптом",
    description:
      "Дизайнерская одноразовая посуда для дерзких кофеен.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${spaceGrotesk.variable} ${syne.variable} font-main antialiased`}
      >
        <LayoutShell footer={<Footer />}>{children}</LayoutShell>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
