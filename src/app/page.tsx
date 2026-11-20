import Home from "@/views/Home";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { daysLeftToPreorder, getPromoPhase } from "@/lib/christmasPromo";

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
    images: ["/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I get juices now, or do I always have to preorder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We make fresh juice every day and always have juice in stock. Preordering helps ensure you get your most preferred flavors, quantities, and at your preferred time.",
      },
    },
    {
      "@type": "Question",
      name: "How long do juices stay fresh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fresh natural juices last 3 days in the refrigerator. Without preservatives, they are best kept frozen and can last up to 3 months.",
      },
    },
    {
      "@type": "Question",
      name: "How many flavors do you have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We have pure juices, cleanse juices, nutty juices, smoothies, and more. Don't see your flavor online? Reach out to create a custom flavor.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer bulk juice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we offer bulk and white-label services starting from 300 bottles. Contact us for more details.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <Home
        promoPhase={getPromoPhase()}
        promoDaysLeft={daysLeftToPreorder()}
      />
    </>
  );
}
