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

interface OrderItem {
  image?: string | null;
  name: string;
  quantity: number;
  price: number;
  pack?: string;
  drinkId?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  address:string;
  city:string;
  createdAt: string;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.token) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/orders/my-orders");

        const parsed: Order[] = (data.orders || []).map((o: any) => ({
          id: o._id,
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                image: it.image ?? it.imageUrl ?? null,
                name: it.name ?? "Item",
                quantity: Number(it.quantity ?? it.qty ?? 1),
                price: Number(it.price ?? 0),
                pack: it.pack ?? null,
                drinkId: it.drinkId ? String(it.drinkId) : undefined,
              }))
            : [],
          totalAmount: Number(o.totalAmount ?? 0),
          orderStatus: o.orderStatus ?? "confirmed",
          paymentStatus: o.paymentStatus ?? "pending",
          createdAt: o.createdAt ?? new Date().toISOString(),
          deliveryDate: o.deliveryDate ?? null,
          deliveryTime: o.deliveryTime ?? null,
          address: o.customer?.address ?? "No address provided",
          city: o.customer?.city ?? "No city provided",
        }));

        setOrders(
          parsed.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (err: any) {
        if (err?.response?.status === 401) {
          toast.error("You are not authorized. Please sign in again.");
          navigate("/auth");
        } else {
          toast.error("Failed to fetch your orders");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authLoading, user?.token, navigate]);

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

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingOrderId(orderId);
      await axiosInstance.put(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatus: "cancelled", paymentStatus: "refunded" } : o
        )
      );
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const isBusy = authLoading || loading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 mt-14">
        <h1 className="font-heading text-center text-xl font-semibold mb-6">MY ORDERS</h1>

        {isBusy ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                    <div className="w-1/3 text-right">
                      <div className="h-6 bg-slate-200 rounded inline-block ml-auto w-20" />
                      <div className="h-8 bg-slate-200 rounded mt-3 w-full" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-slate-200 rounded" />
                        <div className="flex-1">
                          <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
                          <div className="h-3 bg-slate-200 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <Package className="mx-auto h-14 w-14 text-muted-foreground" />
              <h1 className="text-2xl font-bold mt-4">No orders yet</h1>
              <Button className="mt-4" onClick={() => navigate("/products")}>
                Browse Drinks
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <p className="text-[10px] text-muted-foreground mb-1">Order ID: {order.id}</p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>

                    {order.deliveryDate && (
                      <p className="text-xs text-muted-foreground mt-1">Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    )}

                    <p className="text-xs mt-1 font-medium">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                    <p className="text-xs"> Drop location: {order.address} - {order.city}</p>
                    
                  </div>

                  <div className="text-right">
                    <p className={statusClass(order.orderStatus)}>{order.orderStatus.toUpperCase()}</p>
                    <p className="font-medium text-sm mt-2">₵{Number(order.totalAmount ?? 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className={cn("mt-4")}> 
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                        <div
                        key={item.drinkId ?? `${order.id}-item-${index}`}
                        className="bg-gray-100 p-3 rounded-lg flex items-start gap-3"
                        >
                        <img
                            src={item.image ?? "/placeholder.png"}
                            alt={item.name}
                            className="w-14 h-14 rounded object-cover"
                        />

                        <div className="flex-1 flex flex-col">
                            <p className="font-medium text-sm leading-tight">{item.name}</p>

                            <ul className="text-xs text-gray-700 space-y-1 mt-1">
                            {item.pack && <li>Pack: {item.pack}</li>}
                            <li>Quantity: {item.quantity}</li>
                            <li>Price: ₵{Number(item.price ?? 0).toFixed(2)}</li>
                            </ul>
                        </div>
                        </div>




                    ))}
                  </div>

                  {order.orderStatus !== "completed" && order.orderStatus !== "cancelled" && (
                    <Button variant="destructive" className="mt-4 w-full" onClick={() => handleCancelOrder(order.id)} disabled={cancellingOrderId === order.id}>
                      {cancellingOrderId === order.id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Cancel Order"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
