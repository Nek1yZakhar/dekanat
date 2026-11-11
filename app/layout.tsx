import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export const metadata: Metadata = {
  title: "Цифровой деканат — концепт",
  description: "Концепт цифрового деканата для конкурса MGIMO × AI Challenge. Не является официальным сервисом ИГУ.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 flex flex-col">
        <DisclaimerBanner />
        <main className="flex-1 flex flex-col w-full max-w-md mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
