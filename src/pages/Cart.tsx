// src/pages/Cart.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useAuth } from "@/context/Authcontext";
import { Modal } from "@/components/Modal";

const CartItemSkeleton = () => (
  <div className="bg-white border border-green-300 rounded-md p-3 flex flex-row items-center gap-3 animate-pulse">
    <div className="w-24 h-24 bg-gray-200 rounded border flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-8 w-10 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cartItems = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQty = useCartStore((state) => state.updateQty);
  const updatePack = useCartStore((state) => state.updatePack);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.totalPrice);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<"checkout" | "bulk" | null>(null);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);

  // NEW: track quantity inputs for all items
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCart(true);
        await fetchCart();
      } catch (err) {
        console.warn("Failed fetching cart:", err);
      } finally {
        if (mounted) setLoadingCart(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id, fetchCart]);

  // Sync cart quantities to local state
  useEffect(() => {
    const initialQtys: Record<string, string> = {};
    cartItems.forEach((item) => {
      initialQtys[item.id] = item.qty.toString();
    });
    setQtyInputs(initialQtys);
  }, [cartItems]);

  const openAuthModal = (action: "checkout" | "bulk") => {
    setPendingAction(action);
    setModalOpen(true);
  };

  const handleCheckout = () => {
    if (!user) {
      openAuthModal("checkout");
      return;
    }
    toast.success("Proceeding to checkout...");
    navigate("/checkout");
  };

  const handleSignInFromModal = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalOpen(false);
      navigate("/auth", { state: { from: "/cart", action: pendingAction ?? "checkout" } });
    }, 400);
  };

  const handleQtyChange = (itemId: string, val: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: val }));
    const parsed = Number(val);
    if (!isNaN(parsed) && parsed > 0) {
      updateQty(itemId, Math.floor(parsed));
    }
  };

  if (!loadingCart && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-4">Your cart is thirsty</h1>
            <p className="text-muted-foreground mb-8">
              Let's add some juice! Browse our fresh selection and fill up your cart.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/products", { state: { skipHero: true, scrollToTabs: true } })}
            >
              Browse Products
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <Header />
      <motion.div
        className="min-h-screen flex flex-col pb-32 bg-white"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <main className="flex-1 container mx-auto px-2 py-4 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="space-y-3 lg:col-start-2 lg:col-span-1 max-w-3xl w-full mx-auto">
              {loadingCart
                ? Array.from({ length: 4 }).map((_, idx) => <CartItemSkeleton key={idx} />)
                : cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-green-300 rounded-md p-3 flex flex-row items-center gap-3"
                    >
                      <div className="w-24 flex-shrink-0">
                        <img
                          src={item.image || ""}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded border"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder-image.png";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.pack} bottles</p>
                          </div>
                          <Trash2 className="h-4 w-4 cursor-pointer" onClick={() => removeFromCart(item.id)} />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={String(item.pack)}
                              onChange={(e) => {
                                const newPack = Number(e.target.value);
                                updatePack(item.id, newPack);
                              }}
                              className="border px-2 py-1 rounded text-sm font-semibold"
                            >
                              {item.packs?.map((p) => (
                                <option key={p.pack} value={p.pack}>
                                  {p.pack}
                                </option>
                              ))}
                            </select>

                            <p className="text-xs">qty:</p>
                            <input
                            type="number"
                            min={0}
                            value={qtyInputs[item.id] ?? item.qty.toString()}
                            onChange={(e) => {
                                const val = e.target.value; // string
                                setQtyInputs((prev) => ({ ...prev, [item.id]: val }));

                                const num = Number(val);
                                if (!isNaN(num) && num > 0) {
                                updateQty(item.id, num); // pass number here
                                }
                            }}
                            onBlur={() => {
                                const val = qtyInputs[item.id];
                                const num = Number(val);
                                if (!val || isNaN(num) || num < 1) {
                                setQtyInputs((prev) => ({ ...prev, [item.id]: "1" }));
                                updateQty(item.id, 1);
                                }
                            }}
                            className="border px-2 py-1 w-16 text-center rounded text-sm font-semibold"
                            />


                          </div>

                          <div className="text-right min-w-[80px]">
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="font-heading font-semibold text-sm">
                              ₵{(item.price * (item.qty || 1)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
            <div className="hidden lg:block" />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full bg-card backdrop-blur-md border-t border-border shadow-lg">
          <div className="w-full max-w-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {loadingCart ? (
              <div className="w-full flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                  <span className="text-lg font-heading font-bold text-black text-pretty">
                    Estimated Total:
                  </span>
                  <span className="font-heading font-bold text-md">₵{totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="md" onClick={handleCheckout} className="w-full sm:w-auto">
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          title={
            pendingAction === "checkout"
              ? "Please sign in to continue to checkout"
              : "Please sign in to request a bulk quote"
          }
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignInFromModal} disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {isLoading ? "Redirecting..." : "Sign In"}
              </Button>
            </>
          }
        >
          <p className="text-sm">
            You need to be signed in to{" "}
            {pendingAction === "checkout" ? "complete checkout" : "request a bulk quote"}.
            Signing in lets you save orders, view order history, and manage shipping/payment details.
          </p>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
}
