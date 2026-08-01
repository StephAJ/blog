import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

import { Analytics } from "@/components/analytics";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { ThemeProvider } from "@/components/theme-provider";
import { getSettings, siteUrl } from "@/lib/settings";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-code",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);

  return {
    metadataBase: new URL(base),
    title: {
      default: `${settings.siteName} — ${settings.tagline}`,
      template: settings.metaTitleTemplate.replace("%site%", settings.siteName),
    },
    description: settings.description,
    applicationName: settings.siteName,
    authors: [{ name: settings.siteName, url: base }],
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": [{ url: "/feed.xml", title: `${settings.siteName} RSS` }],
        "application/atom+xml": [{ url: "/atom.xml", title: `${settings.siteName} Atom` }],
      },
    },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: `${settings.siteName} — ${settings.tagline}`,
      description: settings.description,
      url: base,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: settings.twitterHandle ?? undefined,
      creator: settings.twitterHandle ?? undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: settings.googleSiteVerification ?? undefined,
      other: settings.bingSiteVerification
        ? { "msvalidate.01": settings.bingSiteVerification }
        : undefined,
    },
    icons: settings.faviconUrl
      ? { icon: settings.faviconUrl }
      : { icon: "/icon.svg", apple: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfa" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${sourceSerif.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <AdSenseScript />
      </body>
    </html>
  );
}
