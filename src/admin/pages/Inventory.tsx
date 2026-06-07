import AdminLayout from "@/admin/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Inventory() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Not currently tracked</p>
        </div>
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Inventory tracking is not active</p>
          <p className="text-sm text-muted-foreground mt-1">This feature is available for future use.</p>
        </Card>
      </div>
    </AdminLayout>
  );
}
