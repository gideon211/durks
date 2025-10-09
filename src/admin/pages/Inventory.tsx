import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const inventory = [
  {
    sku: "SKU-001",
    product: "Mango Sunrise",
    stock: 450,
    reorderPoint: 200,
    supplier: "Fresh Farms Ltd",
    status: "Good",
  },
  {
    sku: "SKU-002",
    product: "Green Detox",
    stock: 230,
    reorderPoint: 150,
    supplier: "Organic Suppliers",
    status: "Good",
  },
  {
    sku: "SKU-003",
    product: "Berry Blast",
    stock: 180,
    reorderPoint: 150,
    supplier: "Fresh Farms Ltd",
    status: "Good",
  },
  {
    sku: "SKU-004",
    product: "Tropical Mix",
    stock: 85,
    reorderPoint: 100,
    supplier: "Fruit Direct",
    status: "Low Stock",
  },
  {
    sku: "SKU-005",
    product: "Citrus Burst",
    stock: 45,
    reorderPoint: 150,
    supplier: "Fresh Farms Ltd",
    status: "Critical",
  },
];

export default function Inventory() {
  const columns = [
    { key: "sku", label: "SKU" },
    { key: "product", label: "Product" },
    {
      key: "stock",
      label: "Stock Level",
      render: (value: number, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{value} units</span>
            <span className="text-muted-foreground">
              Reorder: {row.reorderPoint}
            </span>
          </div>
          <Progress
            value={(value / row.reorderPoint) * 100}
            className="h-2"
          />
        </div>
      ),
    },
    { key: "supplier", label: "Supplier" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant =
          value === "Good"
            ? "default"
            : value === "Low Stock"
            ? "secondary"
            : "destructive";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage product stock levels
            </p>
          </div>
          <Button variant="bulk">
            <Plus className="h-4 w-4 mr-2" />
            Generate PO
          </Button>
        </div>

        {/* Low Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-tropical-pink/10 border-tropical-pink">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-tropical-pink" />
              <div>
                <p className="font-semibold">Critical Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  1 product below critical threshold
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-sunny-yellow/10 border-sunny-yellow">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-sunny-yellow" />
              <div>
                <p className="font-semibold">Low Stock Warning</p>
                <p className="text-sm text-muted-foreground">
                  1 product needs reordering soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <DataTable
          columns={columns}
          data={inventory}
          emptyMessage="No inventory data available"
        />
      </div>
    </AdminLayout>
  );
}
