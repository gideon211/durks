import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Eye, Mail, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/api/axios";

interface Customer {
  email: string;
  fullName: string;
  phone?: string;
  city?: string;
  orders: number;
  totalSpent: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    axiosInstance.get("/orders/admin/customers")
      .then(({ data }) => setCustomers(data.customers ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = useCallback((email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => prev.size === customers.length ? new Set() : new Set(customers.map((c) => c.email)));
  }, [customers]);

  async function handleBatchDelete() {
    if (selected.size === 0) return;
    setBatchDeleting(true);
    try {
      const { data } = await axiosInstance.post("/orders/admin/customer/batch-delete", { emails: Array.from(selected) });
      setCustomers((prev) => prev.filter((c) => !selected.has(c.email)));
      toast.success(`${data.deleted ?? 0} order(s) deleted from ${selected.size} customer(s)`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete customer records");
    } finally {
      setBatchDeleting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const { data } = await axiosInstance.delete(`/orders/admin/customer/${encodeURIComponent(deleteTarget.email)}`);
      setCustomers((prev) => prev.filter((c) => c.email !== deleteTarget.email));
      toast.success(data.message || "Customer deleted");
    } catch {
      toast.error("Failed to delete customer records");
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    {
      key: "_checkbox", label: "",
      render: (_: unknown, row: Customer) => <Checkbox checked={selected.has(row.email)} onCheckedChange={() => toggleSelect(row.email)} />,
    },
    { key: "name", label: "Name", render: (_: unknown, row: Customer) => <span>{row.fullName || row.email}</span> },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (_: unknown, row: Customer) => <span>{row.phone || "—"}</span> },
    { key: "city", label: "City", render: (_: unknown, row: Customer) => <span>{row.city || "—"}</span> },
    { key: "orders", label: "Orders" },
    {
      key: "totalSpent", label: "Total Spent",
      render: (_: unknown, row: Customer) => <span>GH₵ {Number(row.totalSpent).toLocaleString()}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (_: unknown, row: Customer) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(row.email)}`)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => window.open(`mailto:${row.email}`)}><Mail className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  const columnsWithSelectAll = columns.map((col) =>
    col.key === "_checkbox"
      ? { ...col, renderHeader: () => <Checkbox checked={selected.size === customers.length && customers.length > 0} onCheckedChange={toggleAll} /> }
      : col
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">Customers who have placed orders</p>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
            <span className="text-sm font-medium">{selected.size} customer(s) selected</span>
            <Button variant="destructive" size="sm" onClick={handleBatchDelete} disabled={batchDeleting}>
              <Trash className="h-4 w-4 mr-2" />
              {batchDeleting ? "Deleting..." : "Delete Selected"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border bg-card shadow-sm p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <DataTable columns={columnsWithSelectAll} data={customers} emptyMessage="No customers with orders yet" />
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer records?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all orders placed by <strong>{deleteTarget?.fullName || deleteTarget?.email}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete All Orders</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
