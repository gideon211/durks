import { Metadata } from "next";
import Cart from "@/views/Cart";

export const metadata: Metadata = {
  title: "Cart | Duks Juice",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <Cart />;
}
