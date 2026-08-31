"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Customers = dynamic(() => import("@/admin/pages/Customers"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function CustomersPage() {
  return <Customers />;
}
