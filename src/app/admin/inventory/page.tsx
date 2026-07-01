"use client";
import dynamic from "next/dynamic";
const Inventory = dynamic(() => import("@/admin/pages/Inventory"), { ssr: false });
export default function InventoryPage() {
  return <Inventory />;
}
