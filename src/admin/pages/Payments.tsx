import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

const payments = [
  {
    id: "PAY-1234",
    order: "ORD-1234",
    customer: "Kwame Foods Ltd",
    amount: "GH₵ 4,500",
    method: "Bank Transfer",
    status: "Completed",
    date: "2025-10-08",
  },
  {
    id: "PAY-1233",
    order: "ORD-1233",
    customer: "Ama's Cafe",
    amount: "GH₵ 2,100",
    method: "Card",
    status: "Completed",
    date: "2025-10-08",
  },
  {
    id: "PAY-1232",
    order: "ORD-1232",
    customer: "Golden Events",
    amount: "GH₵ 8,900",
    method: "Invoice",
    status: "Pending",
    date: "2025-10-07",
  },
];

export default function Payments() {
  const columns = [
    { key: "id", label: "Payment ID" },
    { key: "order", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "amount", label: "Amount" },
    { key: "method", label: "Method" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "Completed" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all payment transactions
          </p>
        </div>

        <DataTable
          columns={columns}
          data={payments}
          emptyMessage="No payments found"
        />
      </div>
    </AdminLayout>
  );
}
