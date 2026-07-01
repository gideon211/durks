import { Metadata } from "next";
import BulkQuote from "@/views/BulkQuote";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bulk Order Quote | Duks Juice",
  description:
    "Request a custom quote for bulk juice orders, corporate events, weddings, and wholesale supply.",
  openGraph: {
    title: "Bulk Order Quote | Duks Juice",
    description: "Request a custom quote for bulk juice orders.",
    url: "https://duksjuice.com/bulk-quote",
  },
};

export default function BulkQuotePage() {
  return <BulkQuote />;
}
