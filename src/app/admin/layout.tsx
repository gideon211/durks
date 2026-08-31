import AdminLayout from "@/admin/components/AdminLayout";

export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
