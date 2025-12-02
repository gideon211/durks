// src/admin/pages/Orders.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Search, Filter, Eye, Package, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios"; // make sure your axios instance includes auth token
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
}

export default function OrdersAdminPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | string>("all");
  const [dateRange, setDateRange] = useState<"recent" | "month" | "quarter">(
    "recent"
  );

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

async function fetchAllOrders() {
  try {
    setLoading(true);
    setFetchError(null);

    const { data } = await axiosInstance.get("/orders");
    const backendOrders = data.orders ?? data;

    // ⭐ SORT LATEST FIRST (DESCENDING)
    const sorted = Array.isArray(backendOrders)
      ? backendOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // latest on top
        })
      : [];

    setOrders(sorted);
  } catch (err: any) {
    console.error("Failed to fetch orders:", err);
    const msg =
      err?.response?.data?.message || err.message || "Failed to load orders";
    setFetchError(msg);
    toast.error(msg);
  } finally {
    setLoading(false);
  }
}


const rows: TableRow[] = useMemo(
  () =>
    orders.map((o: any) => {
      const id = o._id; // USE BACKEND _id ONLY

      const customer =
        o.customer?.fullName ||
        o.customer?.email ||
        "Unknown";

      const itemsArr = o.items || [];

      const itemsSummary =
        itemsArr.length > 0
          ? itemsArr
              .slice(0, 3)
              .map((it: any) => `${it.name} x ${it.quantity}`)
              .join(", ") +
            (itemsArr.length > 3 ? ` +${itemsArr.length - 3} more` : "")
          : "—";

      const qty = itemsArr.reduce(
        (s: number, it: any) => s + (it.quantity || 0),
        0
      );

      const totalAmount = o.totalAmount || 0;

      const payment = (o.paymentStatus || "pending").toLowerCase();
      const fulfillment = (o.orderStatus || "pending").toLowerCase();

      const date = o.createdAt
        ? new Date(o.createdAt).toLocaleDateString()
        : "—";

      return {
        id,
        customer,
        items: itemsSummary,
        qty,
        total: `GH₵ ${totalAmount.toFixed(2)}`,
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
        if (
          !(
            r.id.toLowerCase().includes(q) ||
            r.customer.toLowerCase().includes(q) ||
            r.items.toLowerCase().includes(q)
          )
        )
          return false;
      }
      if (statusFilter !== "all" && r.fulfillment !== statusFilter.toLowerCase())
        return false;
      if (paymentFilter !== "all" && r.payment !== paymentFilter.toLowerCase()) return false;

      if (dateRange) {
        const days =
          dateRange === "recent"
            ? 7
            : dateRange === "month"
            ? 30
            : dateRange === "quarter"
            ? 90
            : 0;
        if (days > 0) {
          const created = new Date(r._raw?.createdAt || r.date).getTime();
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
          if (isNaN(created) || created < cutoff) return false;
        }
      }

      return true;
    });
  }, [rows, search, statusFilter, paymentFilter, dateRange]);

  async function handleMarkCompleted(orderId?: string) {
    if (!orderId) return;
    const ok = window.confirm("Mark this order as completed/delivered?");
    if (!ok) return;

    try {
      setUpdatingOrderId(orderId);
      const res = await axiosInstance.put(`/orders/${orderId}`, { orderStatus: "completed" });
      const updatedOrder = res.data.order ?? res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: updatedOrder?.orderStatus ?? "completed", paymentStatus: updatedOrder?.paymentStatus ?? o.paymentStatus }
            : o
        )
      );
      toast.success("Order marked as completed");
    } catch (err: any) {
      console.error("Mark completed failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update order");
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
      const res = await axiosInstance.put(`/orders/cancel/${orderId}`);
      const updatedOrder = res.data.order ?? res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: updatedOrder?.orderStatus ?? "cancelled", paymentStatus: updatedOrder?.paymentStatus ?? "refunded" }
            : o
        )
      );
      toast.success("Order cancelled");
    } catch (err: any) {
      console.error("Cancel order failed:", err);
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setUpdatingOrderId(null);
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
        <Badge
          variant={value === "paid" ? "default" : "destructive"}
          className="whitespace-nowrap"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "fulfillment",
      label: "Fulfillment",
      render: (value: string) => {
        const variant =
          value === "completed"
            ? "default"
            : value === "shipped"
            ? "secondary"
            : value === "processing"
            ? "outline"
            : "destructive";
        return (
          <Badge variant={variant} className="whitespace-nowrap">
            {value}
          </Badge>
        );
      },
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row?: TableRow) => {
        const rowId = row?.id;
        return (
          <div className="flex gap-2 justify-center">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/orders/${rowId}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkCompleted(rowId)}
              disabled={updatingOrderId === rowId || !row}
              title="Mark Completed"
            >
              {updatingOrderId === rowId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancelOrder(rowId)}
              disabled={updatingOrderId === rowId || !row}
              title="Cancel Order"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">Orders</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage all customer orders and fulfillment</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 px-8">
          <div className="relative flex-1 min-w-[220px] sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
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

          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
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

          <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px] flex-1 min-w-[160px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full overflow-x-auto rounded-md border bg-card">
          <div className="min-w-[900px]">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : fetchError ? (
              <div className="p-6">
                <p className="text-red-500 mb-4">{fetchError}</p>
                <Button onClick={fetchAllOrders}>Retry</Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredRows}
                emptyMessage="No orders match your filters — try clearing filters."
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
