"use client";
import dynamic from "next/dynamic";
const ActivityLog = dynamic(() => import("@/admin/pages/ActivityLog"), { ssr: false });
export default function ActivityLogPage() {
  return <ActivityLog />;
}
