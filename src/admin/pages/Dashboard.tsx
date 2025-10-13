import AdminLayout from "@/admin/components/AdminLayout";
import StatCard from "@/admin/components/StatCard";
import DataTable from "@/admin/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  Heart,
  TrendingUp,
  Eye,
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

const salesData = [
  { name: "Mon", sales: 4000 },
  { name: "Tue", sales: 3000 },
  { name: "Wed", sales: 5000 },
  { name: "Thu", sales: 4500 },
  { name: "Fri", sales: 6000 },
  { name: "Sat", sales: 5500 },
  { name: "Sun", sales: 4800 },
];

const categoryData = [
  { name: "Pure Juice", value: 35 },
  { name: "Cleanse", value: 25 },
  { name: "Smoothies", value: 20 },
  { name: "Cut Fruits", value: 15 },
  { name: "Gift Packs", value: 5 },
];

const COLORS = ["#FF8C42", "#00C853", "#00B3B8", "#FFD200", "#FF5C8A"];

const recentOrders = [
  {
    id: "ORD-1234",
    customer: "Kwame Foods Ltd",
    total: "GH₵ 4,500",
    status: "Shipped",
    payment: "Paid",
    date: "2025-10-08",
  },
  {
    id: "ORD-1233",
    customer: "Ama's Cafe",
    total: "GH₵ 2,100",
    status: "Processing",
    payment: "Paid",
    date: "2025-10-08",
  },
  {
    id: "ORD-1232",
    customer: "Golden Events",
    total: "GH₵ 8,900",
    status: "Pending",
    payment: "Pending",
    date: "2025-10-07",
  },
];

export default function Dashboard() {
  const columns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "total", label: "Total" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge
          variant={
            value === "Shipped"
              ? "default"
              : value === "Processing"
              ? "secondary"
              : "outline"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      render: (value: string) => (
        <Badge variant={value === "Paid" ? "default" : "destructive"}>{value}</Badge>
      ),
    },
    { key: "date", label: "Date" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold py-2">
            Dashboard Overview
          </h1>

        </div>

        {/* Stats Grid - mobile-first: 2 cols on phones, expands to 4 on large */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value="342"
            change="+12% from last week"
            changeType="positive"
            icon={ShoppingCart}
            color="text-mango-orange"
          />
          <StatCard
            icon={Clock}
            title="Pending Preorders"
            value="28"
            change="+5 new today"
            changeType="positive"
            
            color="text-ocean-teal"
          />
          <StatCard
            title="Revenue"
            value="GH₵ 142,500"
            change="+18% from last month"
            changeType="positive"
            icon={DollarSign}
            color="text-fresh-lime"
          />
          <StatCard
            title="Bulk Quotes"
            value="15"
            change="3 pending approval"
            changeType="neutral"
            icon={FileText}
            color="text-sunny-yellow"
          />
        </div>



        {/* Charts - mobile-first: stacked, becomes 3-column layout on lg (sales spans 2 cols) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-5 w-5 text-fresh-lime" />
                Sales Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* smaller height on mobile for better fit */}
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
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
                      dataKey="sales"
                      stroke="#FF8C42"
                      strokeWidth={2}
                      dot={{ fill: "#FF8C42" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Heart className="h-5 w-5 text-tropical-pink" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSR Impact - stacked on mobile, 3 columns on md+ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Heart className="h-5 w-5 text-tropical-pink" />
              CSR Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Donations</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">GH₵ 12,450</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bottles Recycled</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">8,342</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Communities Reached</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-heading font-bold">Latest Orders</h2>
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={recentOrders}
            emptyMessage="No fresh orders yet — time for a juice break."
          />
        </div>
      </div>
    </AdminLayout>
  );
}
