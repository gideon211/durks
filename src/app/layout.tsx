import type { Metadata } from "next";
import { Sora, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Duks Juice | Fresh Natural Juices",
  description: "Premium, carefully crafted juice blends for families, businesses, events, and wholesale orders.",
  keywords: ["juice", "fresh juice", "natural juice", "smoothies", "wellness shots", "Duks Juice"],
  openGraph: {
    title: "Duks Juice | Fresh Natural Juices",
    description: "Premium, carefully crafted juice blends for families, businesses, events, and wholesale orders.",
    url: "https://www.duksjuice.com",
    siteName: "Duks Juice",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
