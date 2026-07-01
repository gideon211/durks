"use client";
import dynamic from "next/dynamic";
const Customers = dynamic(() => import("@/admin/pages/Customers"), { ssr: false });
export default function CustomersPage() {
  return <Customers />;
}
