"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Dashboard = dynamic(() => import("@/admin/pages/Dashboard"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function DashboardPage() {
  return <Dashboard />;
}
