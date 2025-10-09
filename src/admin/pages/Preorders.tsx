import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, CheckCircle, Edit } from "lucide-react";

const preorders = [
  {
    id: "PRE-1045",
    product: "Pure Juice - Mango Sunrise",
    customer: "Kwame Foods Ltd",
    qty: 200,
    deliveryDate: "2025-10-15",
    status: "Confirmed",
  },
  {
    id: "PRE-1044",
    product: "Smoothies - Berry Blast",
    customer: "Ama's Cafe",
    qty: 150,
    deliveryDate: "2025-10-12",
    status: "Pending Approval",
  },
  {
    id: "PRE-1043",
    product: "Gift Packs - Corporate Bundle",
    customer: "Golden Events",
    qty: 300,
    deliveryDate: "2025-10-20",
    status: "Confirmed",
  },
];

export default function Preorders() {
  const columns = [
    { key: "id", label: "Order ID" },
    { key: "product", label: "Product" },
    { key: "customer", label: "Customer" },
    { key: "qty", label: "Quantity" },
    {
      key: "deliveryDate",
      label: "Delivery Date",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant = value === "Confirmed" ? "default" : "secondary";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
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
          {row.status === "Pending Approval" && (
            <Button variant="ghost" size="sm">
              <CheckCircle className="h-4 w-4 text-fresh-lime" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Preorders</h1>
          <p className="text-muted-foreground mt-1">
            Manage upcoming and scheduled orders
          </p>
        </div>

        <DataTable
          columns={columns}
          data={preorders}
          emptyMessage="No upcoming preorders scheduled"
        />
      </div>
    </AdminLayout>
  );
}
