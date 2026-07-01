"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const AdminOrders = dynamic(() => import("@/admin/pages/Orders"), { ssr: false });
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <AdminOrders />
    </Suspense>
  );
}
