import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Badge } from "@/components/ui/badge";
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
import { Download, ExternalLink, Trash2, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/api/axios";

interface Payment {
  _id: string;
  orderNumber?: string;
  customer?: { fullName?: string; email?: string };
  userId?: { email?: string; username?: string };
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
}

export default function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    axiosInstance.get("/orders/admin/payments")
      .then(({ data }) => setPayments(data.payments ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => prev.size === payments.length ? new Set() : new Set(payments.map((p) => p._id)));
  }, [payments]);

  async function handleBatchDelete() {
    if (selected.size === 0) return;
    setBatchDeleting(true);
    try {
      const { data } = await axiosInstance.post("/orders/admin/batch-delete", { ids: Array.from(selected) });
      setPayments((prev) => prev.filter((p) => !selected.has(p._id)));
      toast.success(`${data.deleted ?? selected.size} payment(s) deleted`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete payments");
    } finally {
      setBatchDeleting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/orders/admin/${deleteTarget._id}`);
      setPayments((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success("Payment record deleted");
    } catch {
      toast.error("Failed to delete payment");
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleDownloadReceipt(payment: Payment) {
    const receipt = [
      "DUKS JUICE - PAYMENT RECEIPT",
      "============================",
      `Order: ${payment.orderNumber || payment._id?.slice(-8)}`,
      `Date: ${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-GB") : "—"}`,
      `Customer: ${payment.customer?.fullName || payment.userId?.email || payment.userId?.username || "—"}`,
      `Amount: GH₵ ${Number(payment.totalAmount ?? 0).toFixed(2)}`,
      `Payment: ${payment.paymentStatus}`,
      "============================",
    ].join("\n");
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.orderNumber || payment._id?.slice(-8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns = [
    {
      key: "_checkbox", label: "",
      render: (_: unknown, row: Payment) => <Checkbox checked={selected.has(row._id)} onCheckedChange={() => toggleSelect(row._id)} />,
    },
    {
      key: "id", label: "Payment ID",
      render: (_: unknown, row: Payment) => <span className="font-mono text-xs">{row._id?.slice(-8)}</span>,
    },
    {
      key: "customer", label: "Customer",
      render: (_: unknown, row: Payment) => <span>{row.customer?.fullName ?? row.userId?.email ?? row.userId?.username ?? "—"}</span>,
    },
    {
      key: "amount", label: "Amount",
      render: (_: unknown, row: Payment) => <span>GH₵ {Number(row.totalAmount ?? 0).toFixed(2)}</span>,
    },
    {
      key: "method", label: "Method",
      render: (_: unknown, row: Payment) => <span>{row.paymentMethod || "—"}</span>,
    },
    {
      key: "status", label: "Status",
      render: (_: unknown, row: Payment) => (
        <Badge variant={row.paymentStatus === "paid" ? "default" : "secondary"}>{row.paymentStatus ?? "pending"}</Badge>
      ),
    },
    {
      key: "date", label: "Date",
      render: (_: unknown, row: Payment) => <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB") : "—"}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (_: unknown, row: Payment) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/orders`)}><ExternalLink className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(row)}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      ),
    },
  ];

  const columnsWithSelectAll = columns.map((col) =>
    col.key === "_checkbox"
      ? { ...col, renderHeader: () => <Checkbox checked={selected.size === payments.length && payments.length > 0} onCheckedChange={toggleAll} /> }
      : col
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Track and manage all payment transactions</p>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
            <span className="text-sm font-medium">{selected.size} payment(s) selected</span>
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
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <DataTable columns={columnsWithSelectAll} data={payments} emptyMessage="No payments found" />
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment record?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the order and its payment record. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
