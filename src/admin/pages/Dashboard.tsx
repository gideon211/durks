import { useState, useEffect } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import StatCard from "@/admin/components/StatCard";
import DataTable from "@/admin/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Package,
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Helmet } from 'react-helmet-async';
import axiosInstance from "@/api/axios";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = ["hsl(221, 83%, 53%)", "hsl(143, 100%, 39%)", "hsl(182, 100%, 36%)", "hsl(48, 100%, 50%)", "hsl(339, 100%, 68%)"];

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, recentOrders: 0 });
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [revenueTrend, setRevenueTrend] = useState<{ month: string; revenue: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, usersRes, drinksRes, trendRes, categoriesRes, ordersRes] = await Promise.allSettled([
          axiosInstance.get("/orders/admin/stats"),
          axiosInstance.get("/orders/admin/customers"),
          axiosInstance.get("/drinks"),
          axiosInstance.get("/orders/admin/revenue-trend"),
          axiosInstance.get("/drinks/stats/category"),
          axiosInstance.get("/orders/admin/all"),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.stats);
        if (usersRes.status === "fulfilled") setUserCount((usersRes.value.data.customers ?? []).length);
        if (drinksRes.status === "fulfilled") setProductCount(drinksRes.value.data.count ?? 0);
        if (trendRes.status === "fulfilled") setRevenueTrend(trendRes.value.data.trend ?? []);
        if (categoriesRes.status === "fulfilled") setCategoryData(categoriesRes.value.data.categories ?? []);
        if (ordersRes.status === "fulfilled") {
          const orders = ordersRes.value.data.orders ?? [];
          setRecentOrders(orders.slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const columns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "items", label: "Items" },
    { key: "total", label: "Total" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant = value === "completed" || value === "delivered"
          ? "default" as const
          : value === "processing" || value === "shipped"
          ? "secondary" as const
          : "outline" as const;
        return <Badge variant={variant} className="whitespace-nowrap">{value}</Badge>;
      },
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: string) => (
        <Badge variant={value === "paid" ? "default" : "destructive"} className="whitespace-nowrap">{value}</Badge>
      ),
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row?: Record<string, unknown>) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/orders`)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  const tableData = recentOrders.map((o) => {
    const itemsArr = o.items ?? [];
    const itemsSummary = itemsArr.slice(0, 2).map((it) => `${it.name ?? "?"} x${it.quantity ?? 1}`).join(", ");
    const qty = itemsArr.reduce((s, it) => s + (it.quantity ?? 0), 0);
    return {
      id: o.orderNumber ?? o._id?.slice(-6) ?? "—",
      customer: o.customer?.fullName ?? o.customer?.email ?? "—",
      items: itemsSummary || "—",
      total: `GH₵ ${Number(o.totalAmount ?? 0).toFixed(2)}`,
      status: o.orderStatus ?? "pending",
      payment: o.paymentStatus ?? "pending",
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "—",
      qty,
    };
  });

  return (
    <AdminLayout>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold py-2">Dashboard Overview</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              change={`+${stats.recentOrders} this week`}
              changeType="positive"
              icon={ShoppingCart}
              color="text-primary"
            />
            <StatCard
              icon={Clock}
              title="Pending Orders"
              value={stats.pendingOrders}
              change="Awaiting fulfillment"
              changeType="neutral"
              color="text-amber-500"
            />
            <StatCard
              title="Revenue"
              value={`GH₵ ${Number(stats.totalRevenue).toLocaleString()}`}
              change="From paid orders"
              changeType="positive"
              icon={DollarSign}
              color="text-emerald-500"
            />
            <StatCard
              title="Customers"
              value={userCount}
              change={`${productCount} products`}
              changeType="neutral"
              icon={Users}
              color="text-blue-500"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : (
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend.length > 0 ? revenueTrend : [{ month: "No data", revenue: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ fill: "hsl(221, 83%, 53%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Package className="h-5 w-5 text-primary" />
                Products by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : (
                <div style={{ width: "100%", height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData.length > 0 ? categoryData.map((c) => ({ name: c.name, value: c.count })) : [{ name: "No data", value: 1 }]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-heading font-bold">Latest Orders</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
              View All Orders
            </Button>
          </div>
          {loading ? (
            <Card className="shadow-sm border">
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <DataTable columns={columns} data={tableData} emptyMessage="No orders yet." />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
