import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";

import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ThereIsASiteForThat",
    template: "%s | ThereIsASiteForThat",
  },
  description:
    "Need a website to do X? Here's the best one. Search a task and get the best matching site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
