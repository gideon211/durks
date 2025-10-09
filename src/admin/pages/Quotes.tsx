import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Download } from "lucide-react";

const quotes = [
  {
    id: "QTE-1045",
    company: "Kwame Foods Ltd",
    qty: 500,
    estimatedTotal: "GH₵ 22,500",
    status: "Pending",
    created: "2025-10-08",
  },
  {
    id: "QTE-1044",
    company: "Golden Events",
    qty: 300,
    estimatedTotal: "GH₵ 15,200",
    status: "Approved",
    created: "2025-10-07",
  },
  {
    id: "QTE-1043",
    company: "Ama's Cafe Chain",
    qty: 800,
    estimatedTotal: "GH₵ 35,400",
    status: "Converted",
    created: "2025-10-06",
  },
  {
    id: "QTE-1042",
    company: "Corporate Ltd",
    qty: 200,
    estimatedTotal: "GH₵ 9,800",
    status: "Denied",
    created: "2025-10-05",
  },
];

export default function Quotes() {
  const columns = [
    { key: "id", label: "Quote ID" },
    { key: "company", label: "Company" },
    { key: "qty", label: "Quantity" },
    { key: "estimatedTotal", label: "Est. Total" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant =
          value === "Approved"
            ? "default"
            : value === "Converted"
            ? "secondary"
            : value === "Denied"
            ? "destructive"
            : "outline";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { key: "created", label: "Created" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === "Pending" && (
            <>
              <Button variant="ghost" size="sm">
                <CheckCircle className="h-4 w-4 text-fresh-lime" />
              </Button>
              <Button variant="ghost" size="sm">
                <XCircle className="h-4 w-4 text-tropical-pink" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Quotes & Bulk Requests</h1>
            <p className="text-muted-foreground mt-1">
              Looks good! Let's confirm these deals.
            </p>
          </div>
          <Button variant="bulk">
            <Download className="h-4 w-4 mr-2" />
            Export Quotes
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={quotes}
          emptyMessage="No bulk quotes submitted yet"
        />
      </div>
    </AdminLayout>
  );
}
