// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import axiosInstance from "@/api/axios"; // Make sure this axios instance has auth headers set

interface OrderItem {
  drinkId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/orders/my-orders");
        const ordersFromApi = (data.orders || []).map((o: any) => ({
          id: o._id,
          items: o.items || [],
          totalAmount: o.totalAmount ?? 0,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        }));
        setOrders(ordersFromApi);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        toast.error("Failed to fetch your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const statusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Processing";
      case "completed":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent font-semibold";
      case "cancelled":
        return "text-destructive font-semibold";
      case "confirmed":
        return "text-primary font-semibold";
      default:
        return "text-foreground font-semibold";
    }
  };

  const canCancel = (order: Order) => {
    // Allow cancellation only for pending/confirmed orders (not for completed/cancelled)
    return order.orderStatus === "pending" || order.orderStatus === "confirmed";
  };

  const handleCancelOrder = async (orderId: string) => {
    const ok = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
    if (!ok) return;

    try {
      setCancellingOrderId(orderId);
      // Call backend cancel route
      const res = await axiosInstance.put(`/orders/cancel/${orderId}`);
      // Backend should return updated order — if not, optimistically update
      const updatedOrder = res.data.order;
      if (updatedOrder) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? {
          id: updatedOrder._id ?? orderId,
          items: updatedOrder.items ?? [],
          totalAmount: updatedOrder.totalAmount ?? (prev.find(p => p.id === orderId)?.totalAmount ?? 0),
          orderStatus: updatedOrder.orderStatus ?? "cancelled",
          paymentStatus: updatedOrder.paymentStatus ?? "refunded",
          createdAt: updatedOrder.createdAt ?? (prev.find(p => p.id === orderId)?.createdAt ?? new Date().toISOString()),
        } : o)));
      } else {
        // fallback: set local order status to cancelled
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: "cancelled", paymentStatus: "refunded" } : o)));
      }

      toast.success("Order cancelled. Refund will be processed if applicable.");
    } catch (err) {
      console.error("Cancel order failed:", err);
      toast.error("Failed to cancel order. Try again.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // UI states
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-8">
              You need an account to view your orders.
            </p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Loader2 className="animate-spin h-12 w-12 text-accent" />
        </main>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-4">No orders yet</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't placed any orders yet.
            </p>
            <Button
              onClick={() =>
                navigate("/products", { state: { skipHero: true, scrollToTabs: true } })
              }
            >
              Browse Products
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4">
        <h1 className="font-heading font-semibold text-3xl md:text-4xl mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Order ID</div>
                  <div className="font-heading font-semibold">{order.id}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className={statusClass(order.orderStatus)}>
                    {statusText(order.orderStatus)}
                  </div>
                  <div className="text-sm mt-2 font-heading font-bold">
                    ₵{order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.drinkId}
                      className="flex items-center gap-3 bg-muted border border-border rounded p-2"
                    >
                      <div className="w-20 flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ₵{item.price.toFixed(2)} each
                        </div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-muted-foreground text-sm">Order Summary</div>
                  <div className="font-heading font-semibold text-lg mt-2">
                    ₵{order.totalAmount.toFixed(2)}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigator.clipboard?.writeText(order.id)}
                      >
                        Copy Order ID
                      </Button>

                      {canCancel(order) && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                        >
                          {cancellingOrderId === order.id ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Order"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
