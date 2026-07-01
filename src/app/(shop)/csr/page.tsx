import { Metadata } from "next";
import CSR from "@/views/CSR";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Corporate Social Responsibility | Duks Juice",
  description:
    "Learn about Duks Juice's commitment to community health, education, and sustainability through our CSR initiatives.",
  openGraph: {
    title: "CSR | Duks Juice",
    description:
      "Our commitment to community health, education, and sustainability.",
    url: "https://duksjuice.com/csr",
  },
};

export default function CSRPage() {
  return <CSR />;
}
