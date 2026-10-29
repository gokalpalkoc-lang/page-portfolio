import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://devtga.com"),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#16181c" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-fg">{children}</body>
    </html>
  );
}
