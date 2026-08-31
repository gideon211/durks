"use client";

import { useMemo } from "react";
import StatCard from "@/admin/components/StatCard";
import DataTable from "@/admin/components/DataTable";
import { Button } from "@/components/ui/button";
import { ShimmerBar } from "@/components/ui/shimmer-bar";
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { useAdminDashboard } from "@/admin/queries";

const CHART_COLORS = ["#3b82f6", "#10b981", "#06b6d4", "#f59e0b", "#ec4899"];

function formatTrendDate(value: string): string {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });
}

interface Order {
  _id: string;
  orderNumber?: string;
  customer?: { fullName?: string; email?: string };
  items?: { name?: string; quantity?: number }[];
  totalAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { data, isLoading } = useAdminDashboard();

  const stats = useMemo(
    () => ({
      totalOrders: data?.stats.totalOrders ?? 0,
      totalRevenue: data?.stats.totalRevenue ?? 0,
      pendingOrders: data?.stats.pendingOrders ?? 0,
      ordersThisWeek: data?.stats.ordersThisWeek ?? 0,
    }),
    [data]
  );
  const userCount = data?.customerCount ?? 0;
  const productCount = data?.productCount ?? 0;
  const revenueTrend = data?.revenueTrend ?? [];
  const categoryData = data?.categories ?? [];
  const recentOrders = useMemo(() => (data?.recentOrders ?? []) as Order[], [data?.recentOrders]);
  const loading = isLoading;

  const columns = useMemo(
    () => [
      { key: "id", label: "Order" },
      { key: "customer", label: "Customer" },
      { key: "items", label: "Items" },
      { key: "total", label: "Total" },
      {
        key: "status",
        label: "Status",
        render: (value: string) => {
          const colors: Record<string, string> = {
            completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
            delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
            processing: "bg-blue-50 text-blue-700 border-blue-200",
          shipped: "bg-blue-50 text-blue-700 border-blue-200",
          pending: "bg-amber-50 text-amber-700 border-amber-200",
          cancelled: "bg-red-50 text-red-700 border-red-200",
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${colors[value] || "bg-muted text-muted-foreground border-border"}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${value === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {value}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "",
      render: () => (
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")} className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground">
          View
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      ),
    },
    ],
    [router]
  );

  const tableData = useMemo(
    () =>
      recentOrders.map((o) => {
        const itemsArr = o.items ?? [];
        const itemsSummary = itemsArr.slice(0, 2).map((it) => `${it.name ?? "?"} x${it.quantity ?? 1}`).join(", ");
        return {
          id: o.orderNumber ?? o._id?.slice(-6) ?? "\u2014",
          customer: o.customer?.fullName ?? o.customer?.email ?? "\u2014",
          items: itemsSummary || "\u2014",
          total: `GH\u20B5 ${Number(o.totalAmount ?? 0).toFixed(2)}`,
          status: o.orderStatus ?? "pending",
          payment: o.paymentStatus ?? "pending",
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "\u2014",
        };
      }),
    [recentOrders]
  );

  return (
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your store performance</p>
        </div>

        {/* Stat cards */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-muted/10 rounded-xl p-4 md:p-6">
                  <ShimmerBar className="h-3 w-3/4 mb-3" />
                  <ShimmerBar className="h-8 w-1/2 mb-3" />
                  <ShimmerBar className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-4 lg:gap-5 lg:grid-cols-4">
            <StatCard title="Total Orders" value={stats.totalOrders} change={`+${stats.ordersThisWeek} this week`} changeType="positive" icon={ShoppingCart} color="text-blue-500" />
            <StatCard title="Pending" value={stats.pendingOrders} change="Awaiting fulfillment" changeType="neutral" icon={Clock} color="text-amber-500" />
            <StatCard title="Revenue" value={`GH\u20B5 ${Number(stats.totalRevenue).toLocaleString()}`} change="From paid orders" changeType="positive" icon={DollarSign} color="text-emerald-500" />
            <StatCard title="Customers" value={userCount} change={`${productCount} products`} changeType="neutral" icon={Users} color="text-blue-500" />
          </div>
        )}

        {/* Charts — asymmetrical bento */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Revenue chart — spans 2 cols */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 sm:p-6 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Revenue Trend</h3>
                  <p className="text-[11px] text-muted-foreground">Last 30 days</p>
                </div>
              </div>
            </div>
            {loading ? (
              <ShimmerBar className="h-[220px] w-full rounded-xl" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend.length > 0 ? revenueTrend : [{ date: "No data", revenue: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatTrendDate} minTickGap={28} tickMargin={8} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={36} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "13px" }}
                      cursor={{ stroke: "#e2e8f0" }}
                      labelFormatter={(label) => formatTrendDate(String(label))}
                      formatter={(value) => [`GH₵ ${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category pie chart */}
          <div className="rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 sm:p-6 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Package className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Categories</h3>
                <p className="text-[11px] text-muted-foreground">Product distribution</p>
              </div>
            </div>
            {loading ? (
              <ShimmerBar className="h-[220px] w-full rounded-xl" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length > 0 ? categoryData.map((c) => ({ name: c.name, value: c.count })) : [{ name: "No data", value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "13px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Legend */}
            {!loading && categoryData.length > 0 && (
              <div className="flex flex-wrap gap-x-2.5 gap-y-1.5 mt-3 overflow-hidden">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[11px] text-muted-foreground truncate max-w-24">{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold">Recent Orders</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/orders")} className="rounded-xl h-9 text-xs font-medium">
              View All
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="bg-muted/10 rounded-xl p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <ShimmerBar className="h-4 w-full sm:w-20" />
                  <ShimmerBar className="h-4 w-full sm:w-28" />
                  <ShimmerBar className="h-4 w-full sm:w-32" />
                  <ShimmerBar className="h-4 w-full sm:w-16" />
                  <ShimmerBar className="h-6 w-full sm:w-16 rounded-full" />
                  <ShimmerBar className="h-6 w-full sm:w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={columns} data={tableData} emptyMessage="No orders yet." />
          )}
        </div>
      </div>
  );
}
