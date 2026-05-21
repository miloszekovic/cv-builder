import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "@/styles/print.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

function metadataBase(): URL | undefined {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return undefined;
}

const base = metadataBase();

export const metadata: Metadata = {
  ...(base ? { metadataBase: base } : {}),
  title: "CV Builder",
  description: "Create, preview, and export a professional CV as PDF.",
  applicationName: "CV Builder",
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  appleWebApp: {
    capable: true,
    title: "CV Builder",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "en",
    url: "/",
    siteName: "CV Builder",
    title: "CV Builder",
    description: "Create, preview, and export a professional CV as PDF.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Builder",
    description: "Create, preview, and export a professional CV as PDF.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-full font-sans text-[0.9375rem] leading-relaxed text-zinc-900 motion-safe:scroll-smooth sm:text-base dark:text-zinc-50"
      >
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {children}
      </body>
    </html>
  );
}
