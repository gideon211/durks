import type { Metadata } from "next";
import { Sora, Poppins, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

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

const caveat = Caveat({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://duksjuice.com"),
  title: "Duks Juice | Fresh Natural Juices",
  description: "Premium, carefully crafted juice blends for families, businesses, events, and wholesale orders.",
  keywords: ["juice", "fresh juice", "natural juice", "smoothies", "wellness shots", "Duks Juice"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-GH": "https://duksjuice.com",
      "x-default": "https://duksjuice.com",
    },
  },
  openGraph: {
    title: "Duks Juice | Fresh Natural Juices",
    description: "Premium, carefully crafted juice blends for families, businesses, events, and wholesale orders.",
    url: "https://duksjuice.com",
    siteName: "Duks Juice",
    locale: "en_GH",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Duks Juice | Fresh Natural Juices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duks Juice | Fresh Natural Juices",
    description: "Premium, carefully crafted juice blends for families, businesses, events, and wholesale orders.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${poppins.variable} ${caveat.variable}`}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Duks Juice",
            url: BASE,
            logo: `${BASE}/images/logo.svg`,
            description:
              "Premium cold-pressed juices, smoothies, wellness shots, and gift packs in Ghana. Fresh daily, no additives.",
            telephone: ["+233202427880", "+233240076685"],
            address: {
              "@type": "PostalAddress",
              streetAddress: "Madina Estate",
              addressLocality: "Accra",
              addressCountry: "GH",
            },
            sameAs: [
              "https://www.facebook.com/duks_juice",
              "https://www.instagram.com/duks_juice",
              "https://www.tiktok.com/@duks_juice",
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Duks Juice",
            url: BASE,
            description:
              "Premium cold-pressed juices, smoothies, wellness shots, and gift packs.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${BASE}/products?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            name: "Duks Juice",
            image: `${BASE}/images/logo.svg`,
            url: BASE,
            servesCuisine: "Juice, Smoothies, Wellness, Fresh Fruits",
            description:
              "Premium cold-pressed juices, smoothies, wellness shots, and gift packs. Fresh daily, no additives. Order online for delivery in Accra.",
            telephone: ["+233202427880", "+233240076685"],
            areaServed: {
              "@type": "City",
              name: "Accra",
              sameAs: "https://en.wikipedia.org/wiki/Accra",
              addressCountry: "GH",
            },
            address: {
              "@type": "PostalAddress",
              streetAddress: "Madina Estate",
              addressLocality: "Accra",
              addressCountry: "GH",
            },
            openingHoursSpecification: [
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "08:00", closes: "18:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "08:00", closes: "18:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "08:00", closes: "18:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "08:00", closes: "18:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "08:00", closes: "18:00" },
              { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "16:00" },
            ],
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(reg) { reg.unregister(); });
                });
                if (caches) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(k) { caches.delete(k); });
                  });
                }
              }
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
