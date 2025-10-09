// src/pages/Cart.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useAuth } from '@/context/Authcontext';
import { Modal } from '@/components/Modal';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cartItems = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQty = useCartStore((state) => state.updateQty);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const setCart = useCartStore((state) => state.setCart);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<'checkout' | 'bulk' | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Restore pendingCart snapshot after sign-in
  useEffect(() => {
    try {
      const pendingCartRaw = localStorage.getItem('pendingCart');
      if (user && pendingCartRaw) {
        const parsed = JSON.parse(pendingCartRaw) as CartItem[] | undefined;
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof setCart === 'function') {
            // Replace store cart with saved snapshot (you may prefer merge logic)
            setCart(parsed);
            toast.success('Restored your saved cart after signing in');
          } else {
            console.warn('setCart not available on cart store — pendingCart not restored automatically.');
          }
        }
        localStorage.removeItem('pendingCart');
      }
    } catch (err) {
      console.warn('Error restoring pendingCart', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-redirect to checkout if user becomes authenticated and pendingCheckout exists.
  useEffect(() => {
    if (!user) return;
    try {
      const pending = localStorage.getItem('pendingCheckout');
      if (pending) {
        localStorage.removeItem('pendingCheckout');
        // small delay for UX (optional)
        setTimeout(() => {
          navigate('/checkout');
        }, 250);
      }
    } catch (err) {
      console.warn('Error handling pendingCheckout', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openAuthModal = (action: 'checkout' | 'bulk') => {
    setPendingAction(action);
    setModalOpen(true);
  };

  const handleCheckout = () => {
    if (!user) {
      openAuthModal('checkout');
      return;
    }
    toast.success('Proceeding to checkout...');
    setTimeout(() => navigate('/checkout'), 800);
  };

  const handleBulkQuote = () => {
    if (!user) {
      openAuthModal('bulk');
      return;
    }
    toast.success('Converting to bulk quote...');
    navigate('/bulk-quote');
  };

  const handleSignInFromModal = () => {
    try {
      setIsLoading(true);
      localStorage.setItem('pendingCheckout', JSON.stringify({ from: '/cart', action: pendingAction ?? 'checkout' }));
    } catch (err) {
      console.warn('Could not persist pendingCheckout', err);
    }

    setTimeout(() => {
      setIsLoading(false);
      setModalOpen(false);
      navigate('/auth', { state: { from: '/cart' } });
    }, 800);
  };

  if (cartItems.length === 0) {
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
              onClick={() => navigate('/products', { state: { skipHero: true, scrollToTabs: true } })}
            >
              Browse Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen flex flex-col"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Header />
        <main className="flex-1 container mx-auto px-4 py-2">
          {/* <h1 className="font-heading font-semibold text-3xl md:text-4xl mb-6">Cart</h1> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="lg:col-span-2 space-y-2">
              {cartItems.map((item: CartItem) => (
                <div key={item.id} className="bg-card border border-border rounded-xl p-3 flex flex-row items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">₵{item.price.toFixed(2)} each</p>
                      </div>

                      <div className="flex items-start gap-1">
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeFromCart(item.id)}
                          className="p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Decrease quantity for ${item.name}`}
                          onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        >
                          <Minus />
                        </Button>

                        <span className="px-2 py-2 rounded-md border border-border text-xs text-center min-w-[28px]">
                          {item.qty}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Increase quantity for ${item.name}`}
                          onClick={() => updateQty(item.id, item.qty + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-heading font-semibold text-sm">
                          ₵{(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <div className="bg-card border border-border rounded-xl p-6 lg:sticky lg:top-24">
                <h2 className="font-heading font-semibold text-2xl mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₵{totalPrice().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bulk Discount</span>
                    <span className="font-semibold text-accent">-₵0.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-heading font-bold text-lg">Total</span>
                    <span className="font-heading font-bold text-xl">₵{totalPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="md" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="md"
                    onClick={() => {
                      clearCart();
                      try { localStorage.removeItem('pendingCart'); } catch (err) {}
                      toast.success('Cart cleared');
                    }}
                  >
                    Clear Cart
                  </Button>


                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Need bulk pricing? Use the bulk quote option for discounts on large orders.
              </div>
            </div>
          </div>
        </main>
        <Footer />

        <Modal
          isOpen={isModalOpen}
          title={pendingAction === 'checkout' ? 'Please sign in to continue to checkout' : 'Please sign in to request a bulk quote'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSignInFromModal}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {isLoading ? 'Redirecting...' : 'Sign In'}
              </Button>
            </>
          }
        >
          <p className="text-sm">
            You need to be signed in to {pendingAction === 'checkout' ? 'complete checkout' : 'request a bulk quote'}. Signing in lets you save orders, view order history and manage shipping/payment details.
          </p>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
}
