"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Settings = dynamic(() => import("@/admin/pages/Settings"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function SettingsPage() {
  return <Settings />;
}
