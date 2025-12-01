// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import axiosInstance from "@/api/axios";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  items: any[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/orders/my-orders");

        const parsed = (data.orders || []).map((o: any) => ({
          id: o._id,
          items: o.items || [],
          totalAmount: o.totalAmount ?? 0,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        }));

        // newest first
        const sorted = parsed.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(sorted);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        toast.error("Failed to fetch your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const statusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 font-semibold";
      case "cancelled":
        return "text-red-500 font-semibold";
      case "confirmed":
        return "text-blue-600 font-semibold";
      default:
        return "text-yellow-600 font-semibold";
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleCancelOrder = async (orderId: string) => {
    const ok = window.confirm("Are you sure you want to cancel this order?");
    if (!ok) return;

    try {
      setCancellingOrderId(orderId);
      await axiosInstance.put(`/orders/cancel/${orderId}`);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: "cancelled", paymentStatus: "refunded" }
            : o
        )
      );

      toast.success("Order cancelled");
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // No user
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </main>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-accent" />
        </main>
      </div>
    );
  }

  // No orders
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-14 w-14 text-muted-foreground" />
            <h1 className="text-2xl font-bold mt-4">No orders yet</h1>
            <Button className="mt-4" onClick={() => navigate("/products")}>
              Browse Drinks
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 mt-10">
        <h1 className="font-heading text-3xl font-bold mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              {/* Small Order ID */}
              <p className="text-[10px] text-muted-foreground mb-1">
                Order ID: {order.id}
              </p>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs mt-1">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p className={statusClass(order.orderStatus)}>
                    {order.orderStatus.toUpperCase()}
                  </p>
                  <p className="font-medium text-sm mt-2">
                    ₵{order.totalAmount.toFixed(2)}
                  </p>

                  {/* View More */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => toggleExpand(order.id)}
                  >
                    {expanded === order.id ? "Hide Items" : "View More"}
                  </Button>
                </div>
              </div>

              {/* EXPANDED ORDER ITEMS */}
              <div
                className={cn(
                  "transition-all overflow-hidden mt-4",
                  expanded === order.id ? "max-h-[600px]" : "max-h-0"
                )}
              >
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-3 rounded-lg flex items-center gap-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ₵{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cancel button inside expanded section */}
                {order.orderStatus !== "completed" &&
                  order.orderStatus !== "cancelled" && (
                    <Button
                      variant="destructive"
                      className="mt-4 w-full"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                    >
                      {cancellingOrderId === order.id ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        "Cancel Order"
                      )}
                    </Button>
                  )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
