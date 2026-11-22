import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MAXBridgeInitializer } from "@/components/max-bridge-initializer";
import { ActivityTracker } from "@/components/activity-tracker";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Цифровой деканат — концепт",
  description: "Концепт цифрового деканата для конкурса MGIMO × AI Challenge. Не является официальным сервисом ИГУ.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Деканат ИГУ",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
        <ActivityTracker />
        <MAXBridgeInitializer />
        <Toaster richColors position="top-center" closeButton />
        <DisclaimerBanner />
        <main className="flex-1 flex flex-col w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-3 sm:px-4 transition-all">
          {children}
        </main>
      </body>
    </html>
  );
}
