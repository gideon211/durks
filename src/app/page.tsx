import Home from "@/views/Home";
import { Metadata } from "next";

export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Duks Juice | Fresh Natural Juices in Ghana",
  description:
    "Premium cold-pressed juices, smoothies, wellness shots, and gift packs. Fresh daily, no additives. Order online for delivery in Accra.",
  openGraph: {
    title: "Duks Juice | Fresh Natural Juices",
    description:
      "Premium cold-pressed juices, smoothies, wellness shots, and gift packs. Fresh daily, no additives.",
    url: "https://duksjuice.com",
    siteName: "Duks Juice",
    locale: "en_US",
    type: "website",
  },
};

export default function HomePage() {
  return <Home />;
}
