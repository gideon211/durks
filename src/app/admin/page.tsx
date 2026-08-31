"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const AdminProducts = dynamic(() => import("@/admin/pages/Products"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function AdminProductsPage() {
  return <AdminProducts />;
}
