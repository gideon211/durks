import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Ban, Crown } from "lucide-react";

const users = [
  {
    name: "Kwame Mensah",
    role: "Admin",
    email: "kwame@juice.com",
    accountType: "Corporate",
    lastActive: "2 hours ago",
  },
  {
    name: "Ama Osei",
    role: "Manager",
    email: "ama@juice.com",
    accountType: "Corporate",
    lastActive: "5 hours ago",
  },
  {
    name: "Kofi Asante",
    role: "CSR Officer",
    email: "kofi@juice.com",
    accountType: "Individual",
    lastActive: "1 day ago",
  },
  {
    name: "Abena Adjei",
    role: "Inventory Clerk",
    email: "abena@juice.com",
    accountType: "Individual",
    lastActive: "3 hours ago",
  },
];

export default function Users() {
  const columns = [
    { key: "name", label: "Name" },
    {
      key: "role",
      label: "Role",
      render: (value: string) => {
        const variant =
          value === "Admin"
            ? "default"
            : value === "Manager"
            ? "secondary"
            : "outline";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { key: "email", label: "Email" },
    {
      key: "accountType",
      label: "Account Type",
      render: (value: string) => (
        <Badge variant={value === "Corporate" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    { key: "lastActive", label: "Last Active" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            {row.role === "Admin" ? (
              <Crown className="h-4 w-4 text-sunny-yellow" />
            ) : (
              <Ban className="h-4 w-4 text-tropical-pink" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found"
        />
      </div>
    </AdminLayout>
  );
}
