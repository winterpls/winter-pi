import type { Metadata, Viewport } from "next";
import "./globals.css";

// ============================================================================
// UPDATE SITE_URL AFTER DEPLOYING TO VERCEL
// ============================================================================
const SITE_URL = "https://winter-pi.vercel.app";
const SITE_NAME = "Winter Pi";
const AUTHOR = "James Lee";
const LOCATION = "Stroudsburg, PA";
const SITE_DESC =
  "Winter Pi is a quant-style crypto portfolio research terminal by James Lee (Stroudsburg, PA). Build, test, and track systematic crypto strategies with institutional-grade analytics — Sharpe ratio, drawdown, signals, backtesting. Simulation only, not investment advice.";
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Quant Crypto Portfolio Terminal by ${AUTHOR}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "James Lee",
    "James Lee Stroudsburg",
    "James Lee developer",
    "James Lee portfolio",
    "Winter Pi",
    "crypto portfolio",
    "quant trading",
    "backtesting",
    "crypto simulation",
    "paper trading",
    "Sharpe ratio",
    "momentum strategy",
    "trading journal",
    "Stroudsburg PA developer",
  ],
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: AUTHOR,

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — by ${AUTHOR}, ${LOCATION}`,
    description: SITE_DESC,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} dashboard preview by ${AUTHOR}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Quant Crypto Terminal by ${AUTHOR}`,
    description: SITE_DESC,
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },

  other: {
    author: AUTHOR,
    "geo.region": "US-PA",
    "geo.placename": "Stroudsburg",
    "simulation-only": "true",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD structured data — tells Google exactly who made this site.
// This is what makes "James Lee Stroudsburg" searchable over time.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  author: {
    "@type": "Person",
    name: AUTHOR,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Stroudsburg",
      addressRegion: "PA",
      addressCountry: "US",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
