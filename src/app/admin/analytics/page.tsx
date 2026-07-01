"use client";
import dynamic from "next/dynamic";
const Analytics = dynamic(() => import("@/admin/pages/Analytics"), { ssr: false });
export default function AnalyticsPage() {
  return <Analytics />;
}
