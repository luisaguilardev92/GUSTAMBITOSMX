import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GUSTAMBITOSMX · Tu colección de Fortnite",
  description: "Lleva el progreso de tus Gustambitos de la nueva temporada.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GUSTAMBITOSMX",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/gustambitos-icon-transparent.png",
    shortcut: "/gustambitos-icon-transparent.png",
    apple: "/gustambitos-icon-transparent.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#08082f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
