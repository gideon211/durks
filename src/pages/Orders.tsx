// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import axios from "axios";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  pack?: number;
}

interface Order {
  id: string;
  date: string;
  status: "Pending" | "Processing" | "Delivered" | "Cancelled";
  total: number;
  items: OrderItem[];
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Order[]>(
          `http://localhost:5000/api/orders?userId=${user.id}`
        );
        setOrders(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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
                    {new Date(order.date).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${
                      order.status === "Delivered" ? "text-accent" : ""
                    }`}
                  >
                    {order.status}
                  </div>
                  <div className="text-sm mt-2 font-heading font-bold">
                    ₵{order.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-muted border border-border rounded p-2"
                    >
                      <div className="w-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ₵{item.price.toFixed(2)} each
                        </div>
                        <div className="text-xs text-muted-foreground">Qty: {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="text-muted-foreground text-sm">Order Summary</div>
                  <div className="font-heading font-semibold text-lg mt-2">
                    ₵{order.total.toFixed(2)}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigator.clipboard?.writeText(order.id)}
                    >
                      Copy Order ID
                    </Button>
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
