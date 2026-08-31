"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const ActivityLog = dynamic(() => import("@/admin/pages/ActivityLog"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function ActivityLogPage() {
  return <ActivityLog />;
}
