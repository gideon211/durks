"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Analytics = dynamic(() => import("@/admin/pages/Analytics"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function AnalyticsPage() {
  return <Analytics />;
}
