import { Metadata } from "next";
import PaymentSuccess from "@/views/PaymentSuccess";

export const metadata: Metadata = {
  title: "Payment Successful | Duks Juice",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return <PaymentSuccess />;
}
