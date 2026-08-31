"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Payments = dynamic(() => import("@/admin/pages/Payments"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function PaymentsPage() {
  return <Payments />;
}
