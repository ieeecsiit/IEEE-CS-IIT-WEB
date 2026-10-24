import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "./_components/footer";
import { JsonLd } from "./_components/json-ld";
import { Navbar } from "./_components/navbar";
import { graph, organisationSchema, websiteSchema } from "./_lib/jsonld";
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
    <html lang="en" className={clashDisplay.variable}>
      <body>
        <JsonLd data={graph(organisationSchema(), websiteSchema())} />
        <Navbar />
        <main>{children}</main>
        <Footer />
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
