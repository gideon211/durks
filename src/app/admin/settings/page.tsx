"use client";
import dynamic from "next/dynamic";
const Settings = dynamic(() => import("@/admin/pages/Settings"), { ssr: false });
export default function SettingsPage() {
  return <Settings />;
}
