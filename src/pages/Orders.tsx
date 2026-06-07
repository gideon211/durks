import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  address: string;
  city: string;
  createdAt: string;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
}

function parseOrders(raw: unknown): Order[] {
  const data = raw as { orders?: Record<string, unknown>[] };
  return (data.orders || []).map((o: Record<string, unknown>) => ({
    id: o._id as string,
    items: Array.isArray(o.items)
      ? (o.items as Record<string, unknown>[]).map((it: Record<string, unknown>) => ({
          image: (it.image ?? it.imageUrl ?? null) as string | null,
          name: (it.name ?? "Item") as string,
          quantity: Number(it.quantity ?? it.qty ?? 1),
          price: Number(it.price ?? 0),
          pack: it.pack as string | undefined,
          drinkId: it.drinkId ? String(it.drinkId) : undefined,
        }))
      : [],
    totalAmount: Number(o.totalAmount ?? 0),
    orderStatus: (o.orderStatus ?? "confirmed") as string,
    paymentStatus: (o.paymentStatus ?? "pending") as string,
    createdAt: (o.createdAt ?? new Date().toISOString()) as string,
    deliveryDate: (o.deliveryDate ?? null) as string | null | undefined,
    deliveryTime: (o.deliveryTime ?? null) as string | null | undefined,
    address: ((o.customer as Record<string, unknown>)?.address ?? "No address provided") as string,
    city: ((o.customer as Record<string, unknown>)?.city ?? "No city provided") as string,
  }));
}

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/orders/my-orders");
      const parsed = parseOrders(data);
      return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: !!user?.token && !authLoading,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => axiosInstance.put(`/orders/${orderId}/cancel`),
    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: ["my-orders"] });
      const prev = queryClient.getQueryData<Order[]>(["my-orders"]);
      queryClient.setQueryData<Order[]>(["my-orders"], (old) =>
        old?.map((o) =>
          o.id === orderId ? { ...o, orderStatus: "cancelled", paymentStatus: "refunded" } : o
        )
      );
      return { prev };
    },
    onError: (_err, _orderId, context) => {
      queryClient.setQueryData(["my-orders"], context?.prev);
      toast.error("Failed to cancel order");
    },
    onSuccess: () => toast.success("Order cancelled"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["my-orders"] }),
  });

  const handleCancelOrder = (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    cancelMutation.mutate(orderId);
  };

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

  const isBusy = authLoading || isLoading;

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
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>

                    {order.deliveryDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    )}

                    <p className="text-xs mt-1 font-medium">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs">
                      Drop location: {order.address} - {order.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={statusClass(order.orderStatus)}>{order.orderStatus.toUpperCase()}</p>
                    <p className="font-medium text-sm mt-2">₵{Number(order.totalAmount ?? 0).toFixed(2)}</p>
                    {(order.orderStatus === "confirmed" || order.orderStatus === "pending") && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="mt-2 text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                      </Button>
                    )}
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
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
