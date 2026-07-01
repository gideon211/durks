import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
