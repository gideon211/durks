import AdminLayout from "@/admin/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
  { month: "Jul", revenue: 72000 },
  { month: "Aug", revenue: 65000 },
  { month: "Sep", revenue: 78000 },
  { month: "Oct", revenue: 142500 },
];

const categoryPerformance = [
  { category: "Pure Juice", sales: 45000 },
  { category: "Cleanse", sales: 32000 },
  { category: "Smoothies", sales: 28000 },
  { category: "Cut Fruits", sales: 22000 },
  { category: "Gift Packs", sales: 15500 },
];

const topCustomers = [
  { name: "Kwame Foods Ltd", volume: "GH₵ 42,000", orders: 28 },
  { name: "Golden Events", volume: "GH₵ 38,500", orders: 15 },
  { name: "Ama's Cafe Chain", volume: "GH₵ 35,200", orders: 42 },
  { name: "Corporate Ltd", volume: "GH₵ 29,800", orders: 18 },
  { name: "Fresh Market Co", volume: "GH₵ 24,500", orders: 22 },
];

export default function Analytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your business performance
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <h3 className="text-2xl font-bold mt-1">GH₵ 3,250</h3>
              <p className="text-sm text-fresh-lime mt-1">+8% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Repeat Purchase Rate</p>
              <h3 className="text-2xl font-bold mt-1">68%</h3>
              <p className="text-sm text-fresh-lime mt-1">+5% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Customer Lifetime Value</p>
              <h3 className="text-2xl font-bold mt-1">GH₵ 18,450</h3>
              <p className="text-sm text-fresh-lime mt-1">+12% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Preorder Ratio</p>
              <h3 className="text-2xl font-bold mt-1">32%</h3>
              <p className="text-sm text-muted-foreground mt-1">Of total orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF8C42"
                  strokeWidth={3}
                  dot={{ fill: "#FF8C42", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sales" fill="#00B3B8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Customers by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.orders} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">{customer.volume}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
