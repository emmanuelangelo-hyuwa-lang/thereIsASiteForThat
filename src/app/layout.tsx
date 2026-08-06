import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getSiteUrl } from "@/lib/env";

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

const description =
  "Need a website to do X? Here is the best one. Describe a task in plain language and get the site that does it.";

export const metadata: Metadata = {
  // Without this, the social card URLs resolve against localhost and every
  // share preview breaks in production.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ThereIsASiteForThat",
    template: "%s | ThereIsASiteForThat",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "thereisasiteforthat",
    title: "There is a site for that.",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "There is a site for that.",
    description,
  },
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
