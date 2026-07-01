import { Metadata } from "next";
import Products from "@/views/Products";

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
    openGraph: {
      title: `${name} | Duks Juice`,
      description: `Shop ${name} from Duks Juice. Fresh, natural, delivered daily.`,
      url: `https://duksjuice.com/products/${category}`,
    },
  };
}

export default function CategoryPage() {
  return <Products />;
}
