// src/admin/pages/Orders.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/admin/components/AdminLayout";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Package, X, Loader2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Helmet } from 'react-helmet-async';

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
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | string>("all");
  const [dateRange, setDateRange] = useState<"all" | "recent" | "month" | "quarter">("all");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<RawOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RawOrder | null>(null);

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const { data } = await axiosInstance.get("/orders/admin/all");
      const backendOrders = data.orders ?? data;
      const sorted = Array.isArray(backendOrders)
        ? backendOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      setOrders(sorted);
    } catch (err: unknown) {
      console.error("Failed to fetch orders:", err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e?.response?.data?.message || e.message || "Failed to load orders";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

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
            ? ((o.customer as Record<string, unknown>)?.city as string) || "—"
            : "—";
        const itemsArr = (o.items as Record<string, unknown>[]) || [];
        const itemsSummary =
          itemsArr.length > 0
            ? itemsArr
                .slice(0, 3)
                .map((it: Record<string, unknown>) => `${it.name as string} x ${it.quantity as number}`)
                .join(", ") +
              (itemsArr.length > 3 ? ` +${itemsArr.length - 3} more` : "")
            : "—";
        const qty = itemsArr.reduce((s: number, it: Record<string, unknown>) => s + ((it.quantity as number) || 0), 0);
        const totalAmount = o.totalAmount || 0;
        const payment = (o.paymentStatus || "pending").toLowerCase();
        const fulfillment = (o.orderStatus || "pending").toLowerCase();
        const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "—";
        return {
          id,
          customer,
          customerCity,
          items: itemsSummary,
          qty,
          total: `GH₵ ${Number(totalAmount || 0).toFixed(2)}`,
          payment,
          fulfillment,
          date,
          _raw: o,
        } as TableRow;
      }),
    [orders]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const rawEmail = r._raw?.customer?.email?.toLowerCase() || "";
        if (!(r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.items.toLowerCase().includes(q) || rawEmail.includes(q)))
          return false;
      }
      if (statusFilter !== "all" && r.fulfillment !== statusFilter.toLowerCase()) return false;
      if (paymentFilter !== "all" && r.payment !== paymentFilter.toLowerCase()) return false;
      if (dateRange) {
        const days = dateRange === "recent" ? 7 : dateRange === "month" ? 30 : dateRange === "quarter" ? 90 : 0;
        if (days > 0) {
          const created = new Date(r._raw?.createdAt || r.date).getTime();
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
          if (isNaN(created) || created < cutoff) return false;
        }
      }
      return true;
    });
  }, [rows, search, statusFilter, paymentFilter, dateRange]);

  function openOrderModal(order: RawOrder | undefined | null) {
    if (!order) return;
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  function closeOrderModal() {
    setSelectedOrder(null);
    setIsModalOpen(false);
  }

  function formatDeliveryDate(dateStr?: string | null) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB");
  }

  function formatTime(timeStr?: string | null) {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }

  async function handleMarkCompleted(orderId?: string) {
    if (!orderId) return;
    const ok = window.confirm("Mark this order as completed/delivered?");
    if (!ok) return;
    try {
      setUpdatingOrderId(orderId);
      const res = await axiosInstance.patch(`/orders/admin/${orderId}/status`, { orderStatus: "completed" });
      const updatedOrder = res.data.order ?? res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: updatedOrder?.orderStatus ?? "completed", paymentStatus: updatedOrder?.paymentStatus ?? o.paymentStatus }
            : o
        )
      );
      toast.success("Order marked as completed");
    } catch (err: unknown) {
      console.error("Mark completed failed:", err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e?.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleCancelOrder(orderId?: string) {
    if (!orderId) return;
    const ok = window.confirm("Cancel this order? Payment may be refunded.");
    if (!ok) return;
    try {
      setUpdatingOrderId(orderId);
      const res = await axiosInstance.patch(`/orders/${orderId}/cancel`);
      const updatedOrder = res.data.order ?? res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: updatedOrder?.orderStatus ?? "cancelled", paymentStatus: updatedOrder?.paymentStatus ?? "refunded" }
            : o
        )
      );
      toast.success("Order cancelled");
    } catch (err: unknown) {
      console.error("Cancel order failed:", err);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e?.response?.data?.message || "Failed to cancel order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleDeleteOrder() {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/orders/admin/${deleteTarget._id}`);
      setOrders((prev) => prev.filter((o) => o._id !== deleteTarget._id));
      toast.success("Order deleted permanently");
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "items", label: "Items" },
    { key: "qty", label: "Qty" },
    { key: "total", label: "Total" },
    {
      key: "payment",
      label: "Payment",
      render: (value: string) => (
        <Badge variant={value === "paid" ? "default" : "destructive"} className="whitespace-nowrap">
          {value}
        </Badge>
      ),
    },
    {
      key: "fulfillment",
      label: "Fulfillment",
      render: (value: string) => {
        const green = "bg-emerald-600 text-white hover:bg-emerald-600";
        const classes = value === "completed" ? green : value === "shipped" ? "bg-blue-100 text-blue-800" : value === "processing" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
        return (
          <Badge variant="outline" className={`whitespace-nowrap border-0 ${classes}`}>
            {value}
          </Badge>
        );
      },
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row?: TableRow) => {
        const rowId = row?.id;
        return (
          <div className="flex gap-2 justify-center">
            <Button variant="ghost" size="sm" onClick={() => openOrderModal(row?._raw)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleMarkCompleted(rowId)} disabled={updatingOrderId === rowId || !row} title="Mark Completed">
              {updatingOrderId === rowId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleCancelOrder(rowId)} disabled={updatingOrderId === rowId || !row} title="Cancel Order">
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row?._raw ?? null)} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete Order">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">Orders</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage all orders and fulfillment</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px] sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by order ID or customer..." className="pl-10 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px] flex-1 min-w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
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

          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px] flex-1 min-w-[160px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
            <SelectTrigger className="w-full sm:w-[180px] flex-1 min-w-[160px]">
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

        <div className="w-full overflow-x-auto rounded-md border bg-card">
          <div className="min-w-[900px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : fetchError ? (
              <div className="p-6">
                <p className="text-red-500 mb-4">{fetchError}</p>
                <Button onClick={fetchAllOrders}>Retry</Button>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredRows} emptyMessage="No orders match your filters — try clearing filters." />
            )}
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(v) => { if (!v) closeOrderModal(); }}>
          <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
            <div className="bg-primary px-6 py-5 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider opacity-80">Order</p>
                  <p className="text-lg font-semibold mt-0.5">{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-8) || ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={selectedOrder?.paymentStatus === "paid" ? "default" : "destructive"} className="bg-white/20 text-white border-0 hover:bg-white/20 capitalize">
                    {selectedOrder?.paymentStatus || "—"}
                  </Badge>
                  <Badge variant="outline" className={`border-0 capitalize ${selectedOrder?.orderStatus === "completed" ? "bg-emerald-600 text-white" : selectedOrder?.orderStatus === "cancelled" ? "bg-red-600 text-white" : "bg-white/20 text-white"}`}>
                    {selectedOrder?.orderStatus || "—"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium mt-1.5">{selectedOrder?.customer?.fullName ?? selectedOrder?.customer?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
                  <p className="text-sm mt-1.5">{selectedOrder?.customer?.phone ? `Phone: ${selectedOrder.customer.phone}` : "—"}</p>
                  <p className="text-sm">{selectedOrder?.customer?.email || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delivery Address</p>
                  <p className="text-sm font-medium mt-1.5">
                    {selectedOrder?.customer?.address && selectedOrder?.customer?.address !== "Not provided"
                      ? selectedOrder.customer.address
                      : "—"}
                    {selectedOrder?.customer?.city ? `, ${selectedOrder.customer.city}` : ""}
                    {selectedOrder?.customer?.country ? `, ${selectedOrder.customer.country}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delivery Date</p>
                  <p className="text-sm font-medium mt-1.5">{formatDeliveryDate(selectedOrder?.deliveryDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delivery Time</p>
                  <p className="text-sm font-medium mt-1.5">{formatTime(selectedOrder?.deliveryTime)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Items ({selectedOrder?.items?.length || 0})
                </p>
                {selectedOrder?.items?.length ? (
                  <div className="space-y-2 max-h-44 overflow-auto">
                    {selectedOrder.items.map((it: Record<string, unknown>, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2.5">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-sm font-semibold text-muted-foreground shrink-0 whitespace-nowrap">Qty {it.quantity as number}</span>
                          <span className="text-sm break-words">{it.name as string}{it.pack ? ` (${it.pack}-pack)` : ""}</span>
                        </div>
                        <span className="text-sm font-semibold tabular-nums shrink-0 ml-3">
                          GH₵ {Number(it.price || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Payment: <span className="capitalize font-medium text-foreground">{selectedOrder?.paymentStatus || "—"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="capitalize font-medium text-foreground">{selectedOrder?.orderStatus || "—"}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold tabular-nums">GH₵ {Number(selectedOrder?.totalAmount || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete order?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete order <strong>{deleteTarget?.orderNumber || deleteTarget?._id?.slice(-8) || ""}</strong>. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">Delete Order</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
