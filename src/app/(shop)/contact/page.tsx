import { Metadata } from "next";
import Contact from "@/views/Contact";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us | Duks Juice",
  description:
    "Get in touch with Duks Juice for bulk orders, custom juice blends, corporate events, and wholesale inquiries.",
  openGraph: {
    title: "Contact Us | Duks Juice",
    description:
      "Get in touch for bulk orders, custom blends, and wholesale inquiries.",
    url: "https://duksjuice.com/contact",
  },
};

export default function ContactPage() {
  return <Contact />;
}
