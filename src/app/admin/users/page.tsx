"use client";
import dynamic from "next/dynamic";
import AdminPageLoader from "@/admin/components/AdminPageLoader";
const Users = dynamic(() => import("@/admin/pages/Users"), { ssr: false, loading: () => <AdminPageLoader /> });
export default function UsersPage() {
  return <Users />;
}
