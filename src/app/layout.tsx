import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import "./globals.css";

/**
 * Two voices. Geist carries the whole interface: headlines, body, numbers and
 * labels alike. Instrument Serif appears once per page, on the lead line, so a
 * change of typeface always means a change of intent.
 */
const display = Geist({
  variable: "--font-display",
  subsets: ["latin"],
});

const text = Instrument_Serif({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "ThereIsASiteForThat",
    template: "%s | ThereIsASiteForThat",
  },
  description:
    "Need a website to do X? Here's the best one. Search a task and get the best matching site.",
};

export const viewport: Viewport = {
  themeColor: "#08090a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
