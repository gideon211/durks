"use client";
import dynamic from "next/dynamic";
const AdminProducts = dynamic(() => import("@/admin/pages/Products"), { ssr: false });
export default function AdminProductsPage() {
  return <AdminProducts />;
}
