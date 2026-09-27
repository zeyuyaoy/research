import type { Metadata } from "next";
import { Comic_Neue, Nunito } from "next/font/google";
import "./globals.css";
import "./tokens.css";
import "./appearance.css";
import { Analytics } from "@vercel/analytics/next";
import { site, socialImage } from "@/lib/site";
import { appearanceBootstrapScript } from "@/lib/appearance";
import AppearanceRuntime from "@/components/AppearanceRuntime";
import SiteFooter from "@/components/SiteFooter";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});
const comic = Comic_Neue({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: "Zeyu Yao", url: site.portfolioUrl }],
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@zeyuyaoy",
    title: site.name,
    description: site.description,
    images: [socialImage],
  },
  icons: {
    icon: { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon-32x32.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1d1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${comic.variable}`} suppressHydrationWarning>
      <head>
        <script
          id="appearance-initializer"
          dangerouslySetInnerHTML={{ __html: appearanceBootstrapScript() }}
        />
      </head>
      <body>
        <AppearanceRuntime />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="site-body">{children}</div>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
