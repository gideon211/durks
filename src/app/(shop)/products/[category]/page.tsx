import { Metadata } from "next";
import Products from "@/views/Products";
import JsonLd from "@/components/JsonLd";

const BASE = "https://duksjuice.com";

const categoryNames: Record<string, string> = {
  "pure-juice": "Pure Juices",
  cleanse: "Cleanse Juices",
  shots: "Wellness Shots",
  smoothies: "Smoothies",
  flavors: "Flavors",
  "cut-fruits": "Cut Fruits",
  "gift-packs": "Gift Packs",
  bundle: "Bundles",
  events: "Events",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name =
    categoryNames[category] ||
    category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${name} | Duks Juice`,
    description: `Shop ${name} from Duks Juice. Fresh, natural, delivered daily in Accra.`,
    alternates: {
      canonical: `/products/${category}`,
    },
    openGraph: {
      title: `${name} | Duks Juice`,
      description: `Shop ${name} from Duks Juice. Fresh, natural, delivered daily.`,
      url: `https://duksjuice.com/products/${category}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${name} | Duks Juice`,
        },
      ],
    },
    twitter: {
      images: ["/og-image.png"],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const name =
    categoryNames[category] ||
    category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE },
            { "@type": "ListItem", position: 2, name: "Products", item: `${BASE}/products` },
            { "@type": "ListItem", position: 3, name, item: `${BASE}/products/${category}` },
          ],
        }}
      />
      <Products />
    </>
  );
}
