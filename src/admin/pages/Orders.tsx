"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Package, X, Loader2, Trash2 } from "lucide-react";
import { ShimmerBar } from "@/components/ui/shimmer-bar";
import { useAdminOrders, useUpdateOrderStatus, useCancelOrder, useDeleteOrder } from "@/admin/queries";
import OrderDetailDialog from "@/admin/components/OrderDetailDialog";
import { toast } from "sonner";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawOrder = any;

interface TableRow {
  id: string;
  customer: string;
  items: string;
  qty: number;
  total: string;
  payment: string;
  fulfillment: string;
  date: string;
  _raw?: RawOrder;
  customerCity?: string;
}

export default function OrdersAdminPage() {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams?.get("search") || "");
  const [search, setSearch] = useState(searchInput);
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | string>("all");
  const [dateRange, setDateRange] = useState<"all" | "recent" | "month" | "quarter">("all");
  const [page, setPage] = useState(1);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<RawOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RawOrder | null>(null);

  // Debounce the search box so we don't hit the server on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: ordersData, isLoading, isError, refetch } = useAdminOrders({
    status: statusFilter,
    payment: paymentFilter,
    search,
    dateRange,
    page,
    limit: 50,
  });

  const markCompletedMutation = useUpdateOrderStatus();
  const cancelMutation = useCancelOrder();
  const deleteMutation = useDeleteOrder();

  const orders = useMemo(() => (ordersData?.orders ?? []) as RawOrder[], [ordersData]);
  const total = ordersData?.total ?? 0;
  const pages = ordersData?.pages ?? 1;
  const loading = isLoading;

  const rows: TableRow[] = useMemo(
    () =>
      orders.map((o: Record<string, unknown>) => {
        const id = o._id;
        const customer =
          typeof o.customer === "object" && o.customer !== null
            ? ((o.customer as Record<string, unknown>)?.fullName as string)?.trim() &&
              (o.customer as Record<string, unknown>)?.fullName !== "null null"
              ? (o.customer as Record<string, unknown>)?.fullName as string
              : (o.customer as Record<string, unknown>)?.email as string || "Unknown"
            : "Unknown";
        const customerCity =
          typeof o.customer === "object" && o.customer !== null
            ? ((o.customer as Record<string, unknown>)?.city as string) || "\u2014"
            : "\u2014";
        const itemsArr = (o.items as Record<string, unknown>[]) || [];
        const itemsSummary =
          itemsArr.length > 0
            ? itemsArr
                .slice(0, 3)
                .map((it: Record<string, unknown>) => `${it.name as string} x ${it.quantity as number}`)
                .join(", ") +
              (itemsArr.length > 3 ? ` +${itemsArr.length - 3} more` : "")
            : "\u2014";
        const qty = itemsArr.reduce((s: number, it: Record<string, unknown>) => s + ((it.quantity as number) || 0), 0);
        const totalAmount = o.totalAmount || 0;
        const payment = (o.paymentStatus || "pending").toLowerCase();
        const fulfillment = (o.orderStatus || "pending").toLowerCase();
        const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "\u2014";
        return {
          id,
          customer,
          customerCity,
          items: itemsSummary,
          qty,
          total: `GH\u20B5 ${Number(totalAmount || 0).toFixed(2)}`,
          payment,
          fulfillment,
          date,
          _raw: o,
        } as TableRow;
      }),
    [orders]
  );

  const filteredRows = rows;

  function openOrderModal(order: RawOrder | undefined | null) {
    if (!order) return;
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  function closeOrderModal() {
    setSelectedOrder(null);
    setIsModalOpen(false);
  }

  function errorMessage(err: unknown): string {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e?.response?.data?.message || e?.message || "Something went wrong";
  }

  function handleMarkCompleted(orderId?: string) {
    if (!orderId) return;
    if (!window.confirm("Mark this order as completed/delivered?")) return;
    setUpdatingOrderId(orderId);
    markCompletedMutation.mutate(
      { id: orderId, orderStatus: "completed" },
      {
        onSuccess: () => toast.success("Order marked as completed"),
        onError: (err) => toast.error(errorMessage(err)),
        onSettled: () => setUpdatingOrderId(null),
      }
    );
  }

  function handleCancelOrder(orderId?: string) {
    if (!orderId) return;
    if (!window.confirm("Cancel this order? Payment may be refunded.")) return;
    setUpdatingOrderId(orderId);
    cancelMutation.mutate(orderId, {
      onSuccess: () => toast.success("Order cancelled"),
      onError: (err) => toast.error(errorMessage(err)),
      onSettled: () => setUpdatingOrderId(null),
    });
  }

  function handleDeleteOrder() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => toast.success("Order deleted permanently"),
      onError: (err) => toast.error(errorMessage(err)),
      onSettled: () => setDeleteTarget(null),
    });
  }

  const statusColor = (v: string) => {
    const map: Record<string, string> = {
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return map[v] || "bg-muted text-muted-foreground border-border";
  };

  const columns = [
    { key: "id", label: "Order" },
    { key: "customer", label: "Customer" },
    { key: "items", label: "Items" },
    { key: "qty", label: "Qty" },
    { key: "total", label: "Total" },
    {
      key: "payment",
      label: "Payment",
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${value === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {value}
        </span>
      ),
    },
    {
      key: "fulfillment",
      label: "Status",
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusColor(value)}`}>
          {value}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row?: TableRow) => {
        const rowId = row?.id;
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => openOrderModal(row?._raw)} className="h-8 w-8 p-0 rounded-lg">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleMarkCompleted(rowId)} disabled={updatingOrderId === rowId || !row} title="Mark Completed" className="h-8 w-8 p-0 rounded-lg">
              {updatingOrderId === rowId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleCancelOrder(rowId)} disabled={updatingOrderId === rowId || !row} title="Cancel Order" className="h-8 w-8 p-0 rounded-lg">
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row?._raw ?? null)} className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete Order">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all orders and fulfillment</p>
        </div>

        {/* Filter bar */}
        <div className="rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer..."
                className="pl-10 h-10 rounded-xl border-border/60 bg-muted/30"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-xl border-border/60 bg-muted/30">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-xl border-border/60 bg-muted/30">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(v) => { setDateRange(v as typeof dateRange); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[170px] h-10 rounded-xl border-border/60 bg-muted/30">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="recent">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-muted-foreground font-medium">
            {total} order{total !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Table */}
        {loading ? (
            <div className="bg-muted/10 rounded-xl p-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <ShimmerBar className="h-4 w-full sm:w-20" />
                <ShimmerBar className="h-4 w-full sm:w-28" />
                <ShimmerBar className="h-4 w-full sm:w-40" />
                <ShimmerBar className="h-4 w-full sm:w-12" />
                <ShimmerBar className="h-4 w-full sm:w-20" />
                <ShimmerBar className="h-6 w-full sm:w-16 rounded-full" />
                <ShimmerBar className="h-6 w-full sm:w-16 rounded-full" />
                <ShimmerBar className="h-4 w-full sm:w-20" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-white border border-border/50 p-8 text-center">
            <p className="text-red-500 mb-4 text-sm">Failed to load orders</p>
            <Button onClick={() => refetch()} className="rounded-xl">Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredRows} emptyMessage="No orders match your filters." />
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <p className="text-xs text-muted-foreground font-medium">Page {page} of {pages}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Order detail modal */}
        <OrderDetailDialog
          order={selectedOrder}
          open={isModalOpen}
          onOpenChange={(v) => { if (!v) closeOrderModal(); }}
          onMarkCompleted={handleMarkCompleted}
          onCancelOrder={handleCancelOrder}
          updatingOrderId={updatingOrderId}
        />

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete order <strong>{deleteTarget?.orderNumber || deleteTarget?._id?.slice(-8) || ""}</strong>. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteOrder} className="rounded-xl bg-red-600 hover:bg-red-700">Delete Order</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
