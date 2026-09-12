import type {Metadata} from "next";
import {Nunito} from "next/font/google";
import "./globals.css";
import {Analytics} from "@vercel/analytics/next";

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://research.cytronicoder.com"),
    title: {default: "Peter's Research Projects", template: "%s | Peter's Research"},
    description: "Curated collection of my research work, projects, and publications.",
    alternates: {canonical: "/"},
    openGraph: {
        type: "website", url: "/", siteName: "Peter's Research Projects",
        title: "Peter's Research Projects", description: "Per aspera ad astra!",
        images: ["/opengraph-image"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Peter's Research Projects",
        description: "Per aspera ad astra!",
        images: ["/opengraph-image"]
    },
    icons: {
        icon: "/favicon-32x32.png",
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon-16x16.png",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#f7f5ef"},
        {media: "(prefers-color-scheme: dark)", color: "#171d1a"},
    ],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <script
                id="theme-initializer"
                dangerouslySetInnerHTML={{
                    __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              } catch {}
            `,
                }}
            />
        </head>
        <body className={`${nunito.variable} antialiased`}>
        {children}
        <Analytics/>
        </body>
        </html>
    );
}
