import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "IEEE Computer Society SBC of IIT",
    template: "%s | IEEE Computer Society SBC of IIT",
  },
  description:
    "IEEE Computer Society Student Branch Chapter of the Informatics Institute of Technology (IIT), Sri Lanka. Innovate • Automate • Dominate.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={clashDisplay.variable}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
