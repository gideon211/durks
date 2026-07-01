import { Metadata } from "next";
import Checkout from "@/views/Checkout";

export const metadata: Metadata = {
  title: "Checkout | Duks Juice",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <Checkout />;
}
