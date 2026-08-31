"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerBar } from "@/components/ui/shimmer-bar";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRevenueTrend, useCategoryStats, useOrderStats, useAdminCustomers } from "@/admin/queries";

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface CategoryStat {
  name: string;
  count: number;
}

interface TopCustomer {
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}

function formatTrendDate(value: string): string {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short" });
}

export default function Analytics() {
  const { data: revData, isLoading: revLoading } = useRevenueTrend();
  const { data: catData, isLoading: catLoading } = useCategoryStats();
  const { data: statsData, isLoading: statsLoading } = useOrderStats();
  const { data: custData, isLoading: custLoading } = useAdminCustomers(1, 100);

  const revenueData = (revData?.trend ?? []) as RevenuePoint[];
  const categoryData = (catData?.categories ?? []) as CategoryStat[];
  const s = statsData?.stats;
  const avgOrderValue =
    s && s.totalRevenue && (s.paidOrders || s.totalOrders) ? s.totalRevenue / (s.paidOrders || s.totalOrders) : 0;
  const repeatPurchaseRate = s?.repeatPurchaseRate ?? 0;
  const customerLifetimeValue = s?.customerLifetimeValue ?? 0;
  const preorderRatio = s?.preorderRatio ?? 0;
  const topCustomers = ((custData?.customers ?? []) as TopCustomer[]).slice(0, 5);
  const loading = revLoading || catLoading || statsLoading || custLoading;

  const categoryPerformance = categoryData.map((c) => ({
    category: c.name,
    sales: c.count,
  }));

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into your business performance</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <>
                  <ShimmerBar className="h-3 w-24 mb-2" />
                  <ShimmerBar className="h-6 w-28" />
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Order Value</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-1">GH₵ {(avgOrderValue || 0).toFixed(2)}</h3>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <>
                  <ShimmerBar className="h-3 w-24 mb-2" />
                  <ShimmerBar className="h-6 w-20" />
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Repeat Purchase Rate</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-1">{((repeatPurchaseRate || 0) * 100).toFixed(1)}%</h3>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <>
                  <ShimmerBar className="h-3 w-24 mb-2" />
                  <ShimmerBar className="h-6 w-20" />
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Customer Lifetime Value</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-1">GH₵ {(customerLifetimeValue || 0).toFixed(2)}</h3>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <>
                  <ShimmerBar className="h-3 w-24 mb-2" />
                  <ShimmerBar className="h-6 w-20" />
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">Preorder Ratio</p>
                  <h3 className="text-lg sm:text-2xl font-bold mt-1">{((preorderRatio || 0) * 100).toFixed(1)}%</h3>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ShimmerBar className="h-[300px] w-full rounded-lg" />
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" tickFormatter={formatTrendDate} minTickGap={28} tickMargin={8} />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelFormatter={(label) => formatTrendDate(String(label))}
                      formatter={(value) => [`GH₵ ${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(221, 83%, 53%)" strokeWidth={3} dot={{ fill: "hsl(221, 83%, 53%)", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ShimmerBar className="h-[260px] w-full rounded-lg" />
              ) : (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformance} margin={{ left: 0, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="sales" fill="hsl(182, 100%, 36%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <ShimmerBar className="w-8 h-8 rounded-full" />
                        <div>
                          <ShimmerBar className="h-4 w-28 mb-1" />
                          <ShimmerBar className="h-3 w-16" />
                        </div>
                      </div>
                      <ShimmerBar className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : topCustomers.length > 0 ? (
                <div className="space-y-3">
                  {topCustomers.map((c, i) => (
                    <div key={c.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{c.name || c.email}</p>
                          <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">GH₵ {Number(c.totalSpent).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No customer data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
