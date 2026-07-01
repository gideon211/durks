"use client";
import dynamic from "next/dynamic";
const Payments = dynamic(() => import("@/admin/pages/Payments"), { ssr: false });
export default function PaymentsPage() {
  return <Payments />;
}
