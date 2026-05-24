import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ShoppingBag, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useAuth } from "@/context/Authcontext";
import { Modal } from "@/components/Modal";
import { Helmet } from "react-helmet-async";

const CartItemSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4 animate-pulse">
    <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0" />
    <div className="flex-1 space-y-3">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/4" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
        <div className="h-4 w-16 bg-muted rounded" />
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
  const totalPrice = useCartStore((state) => state.totalPrice);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<"checkout" | "bulk" | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
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
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      navigate("/checkout");
    }, 3000);
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

  const incrementQty = (itemId: string, currentQty: number) => {
    const newQty = currentQty + 1;
    setQtyInputs((prev) => ({ ...prev, [itemId]: newQty.toString() }));
    updateQty(itemId, newQty);
  };

  const decrementQty = (itemId: string, currentQty: number) => {
    if (currentQty <= 1) return;
    const newQty = currentQty - 1;
    setQtyInputs((prev) => ({ ...prev, [itemId]: newQty.toString() }));
    updateQty(itemId, newQty);
  };

  const handleRemove = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    toast.success(`${itemName} removed from cart`);
  };

  if (!loadingCart && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-heading font-bold text-2xl mb-2">Your cart is thirsty</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Let us add some juice! Browse our fresh selection and fill up your cart.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() =>
                navigate("/products", {
                  state: { skipHero: true, scrollToTabs: true },
                })
              }
            >
              Browse Products
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <AnimatePresence>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <motion.div
        className="min-h-screen flex flex-col bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <main className="flex-1 container mx-auto px-4 py-8 mt-16 pb-36">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading text-2xl font-bold">
                Shopping Cart
              </h1>
              <span className="text-sm text-muted-foreground font-medium">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            {loadingCart ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <CartItemSkeleton key={idx} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/50 bg-card shadow-sm p-4 flex items-center gap-4"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        loading="lazy"
                        src={item.image || ""}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/placeholder-image.png";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold text-sm truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.pack} bottles per pack
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={String(item.pack)}
                            onValueChange={(val) =>
                              updatePack(item.id, Number(val))
                            }
                          >
                            <SelectTrigger className="w-20 sm:w-24 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.packs?.map((p) => (
                                <SelectItem
                                  key={p.pack}
                                  value={String(p.pack)}
                                >
                                  {p.pack} pack
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center border border-border/50 rounded-lg">
                            <button
                              onClick={() =>
                                decrementQty(
                                  item.id,
                                  Number(qtyInputs[item.id] ?? item.qty)
                                )
                              }
                              disabled={
                                Number(qtyInputs[item.id] ?? item.qty) <= 1
                              }
                              className="p-1.5 hover:bg-muted transition-colors disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={qtyInputs[item.id] ?? item.qty.toString()}
                              onChange={(e) =>
                                handleQtyChange(item.id, e.target.value)
                              }
                              onBlur={() => {
                                const val = qtyInputs[item.id];
                                const num = Number(val);
                                if (!val || isNaN(num) || num < 1) {
                                  setQtyInputs((prev) => ({
                                    ...prev,
                                    [item.id]: "1",
                                  }));
                                  updateQty(item.id, 1);
                                }
                              }}
                              className="w-10 text-center text-sm font-semibold bg-transparent border-x border-border/50 py-1 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() =>
                                incrementQty(
                                  item.id,
                                  Number(qtyInputs[item.id] ?? item.qty)
                                )
                              }
                              className="p-1.5 hover:bg-muted transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right self-end sm:self-auto">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-heading font-semibold text-sm whitespace-nowrap">
                            ₵
                            {(
                              item.price * (item.qty || 1)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {loadingCart ? (
                <div className="flex items-center justify-between w-full">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-44 bg-muted rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-muted-foreground font-medium">
                      Estimated Total
                    </p>
                    <p className="font-heading font-bold text-xl">
                      ₵{totalPrice().toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full sm:w-auto sm:min-w-[200px]"
                  >
                    {checkingOut ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Proceeding...
                      </span>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          title={
            pendingAction === "checkout"
              ? "Sign in to checkout"
              : "Sign in to request a bulk quote"
          }
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignInFromModal} disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                )}
                {isLoading ? "Redirecting..." : "Sign In"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            You need to be signed in to{" "}
            {pendingAction === "checkout"
              ? "complete checkout"
              : "request a bulk quote"}
            .
          </p>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
}
