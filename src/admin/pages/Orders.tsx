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
import { Search, Filter, Eye, Package } from "lucide-react";

const orders = [
  {
    id: "ORD-1234",
    customer: "Kwame Foods Ltd",
    items: "Pure Juice x 50, Smoothies x 30",
    qty: 80,
    total: "GH₵ 4,500",
    payment: "Paid",
    fulfillment: "Shipped",
    date: "2025-10-08",
  },
  {
    id: "ORD-1233",
    customer: "Ama's Cafe",
    items: "Cleanse Juice x 40",
    qty: 40,
    total: "GH₵ 2,100",
    payment: "Paid",
    fulfillment: "Processing",
    date: "2025-10-08",
  },
  {
    id: "ORD-1232",
    customer: "Golden Events",
    items: "Gift Packs x 100",
    qty: 100,
    total: "GH₵ 8,900",
    payment: "Pending",
    fulfillment: "Pending",
    date: "2025-10-07",
  },
  {
    id: "ORD-1231",
    customer: "Kofi Enterprise",
    items: "Cut Fruits x 60, Pure Juice x 40",
    qty: 100,
    total: "GH₵ 5,200",
    payment: "Paid",
    fulfillment: "Delivered",
    date: "2025-10-06",
  },
];

export default function Orders() {
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
          variant={value === "Paid" ? "default" : "destructive"}
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
          value === "Delivered"
            ? "default"
            : value === "Shipped"
            ? "secondary"
            : value === "Processing"
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
      render: () => (
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Package className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">
              Orders
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage all customer orders and fulfillment
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 px-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              className="pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] flex-1 min-w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Filter */}
          <Select defaultValue="all-payment">
            <SelectTrigger className="w-full sm:w-[180px] flex-1 min-w-[160px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-payment">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select defaultValue="recent">
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

        {/* Orders Table */}
        <div className="w-full overflow-x-auto rounded-md border bg-card">
          <div className="min-w-[900px]">
            <DataTable
              columns={columns}
              data={orders}
              emptyMessage="No fresh orders yet — time for a juice break."
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
