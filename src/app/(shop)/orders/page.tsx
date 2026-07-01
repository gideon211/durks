import { Metadata } from "next";
import Orders from "@/views/Orders";

export const metadata: Metadata = {
  title: "My Orders | Duks Juice",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <Orders />;
}
