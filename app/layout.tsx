import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DataFast } from "@/components/DataFast";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = "MillionDollar — pay your way to #1";
const description =
  "Get on the board for $6 and climb by clicks — or pay $1 over the current #1 to seize the crown instantly.";

export const metadata: Metadata = {
  metadataBase: new URL("https://millliondollar.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://millliondollar.com",
    siteName: "MillionDollar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@MunemulTalha",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const datafastWebsiteId = process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID;
  const datafastDomain =
    process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ?? "millliondollar.com";

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <DataFast websiteId={datafastWebsiteId} domain={datafastDomain} />
      </body>
    </html>
  );
}
