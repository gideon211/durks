"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Inventory = dynamic(() => import("@/admin/pages/Inventory"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function InventoryPage() {
  return <Inventory />;
}
