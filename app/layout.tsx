import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "./_components/footer";
import { Intro } from "./_components/intro";
import { JsonLd } from "./_components/json-ld";
import { Navbar } from "./_components/navbar";
import { SiteChrome } from "./_components/site-chrome";
import { graph, organisationSchema, websiteSchema } from "./_lib/jsonld";
import { introGateScript } from "./_lib/motion";
import { ORGANISATION, SITE_DESCRIPTION, SITE_NAME, SITE_SHORT_NAME, SITE_URL, pageMetadata } from "./_lib/seo";
import "./globals.css";

const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-Extralight.woff2", weight: "200" },
    { path: "./fonts/ClashDisplay-Light.woff2", weight: "300" },
    { path: "./fonts/ClashDisplay-Regular.woff2", weight: "400" },
    { path: "./fonts/ClashDisplay-Medium.woff2", weight: "500" },
    { path: "./fonts/ClashDisplay-Semibold.woff2", weight: "600" },
    { path: "./fonts/ClashDisplay-Bold.woff2", weight: "700" },
  ],
  variable: "--font-clash",
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-6DZN8Z6LM0";
// Dev and preview traffic would otherwise show up in the real analytics.
const ANALYTICS_ENABLED = process.env.NODE_ENV === "production" && GA_ID !== "";

export const metadata: Metadata = {
  ...pageMetadata({ description: SITE_DESCRIPTION, path: "/" }),
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_SHORT_NAME}` },
  applicationName: SITE_SHORT_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  other: { "contact:email": ORGANISATION.email },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#ffa300",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the intro gate script below adds a class to <html> before React loads.
    <html lang="en" className={clashDisplay.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
        {/* Without JavaScript nothing animates in, so show everything. */}
        <noscript>
          <style>{`[data-reveal],[data-hero-fade]{opacity:1!important}.hero-line{transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        {/* Intro: the CS disc zooms in and out, then flies onto the hero. Hidden unless <html> has .intro-active. */}
        <div id="intro" aria-hidden="true">
          <div id="intro-disc" className="logo-mark" />
        </div>
        <Intro />
        <JsonLd data={graph(organisationSchema(), websiteSchema())} />
        <SiteChrome>
          <Navbar />
        </SiteChrome>
        <main>{children}</main>
        <SiteChrome>
          <Footer />
        </SiteChrome>
        {ANALYTICS_ENABLED && (
          <>
            {/* Google Analytics 4. Its enhanced measurement records client-side route changes as page views. */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
