"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const AdminOrders = dynamic(() => import("@/admin/pages/Orders"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function AdminOrdersPage() {
  return <AdminOrders />;
}
