import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail } from "lucide-react";

const customers = [
  {
    name: "Kwame Foods Ltd",
    email: "contact@kwamefoods.com",
    phone: "+233 20 123 4567",
    type: "Corporate",
    orders: 28,
    totalSpent: "GH₵ 42,000",
  },
  {
    name: "Ama Osei",
    email: "ama@email.com",
    phone: "+233 24 987 6543",
    type: "Individual",
    orders: 15,
    totalSpent: "GH₵ 12,450",
  },
  {
    name: "Golden Events",
    email: "events@golden.com",
    phone: "+233 20 555 8888",
    type: "Corporate",
    orders: 22,
    totalSpent: "GH₵ 38,500",
  },
];

export default function Customers() {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <Badge variant={value === "Corporate" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    { key: "orders", label: "Orders" },
    { key: "totalSpent", label: "Total Spent" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            View and manage customer accounts
          </p>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          emptyMessage="No customers found"
        />
      </div>
    </AdminLayout>
  );
}
