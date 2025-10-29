// src/pages/Cart.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Trash2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useAuth } from '@/context/Authcontext';
import { Modal } from '@/components/Modal';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Zustand cart store hooks
  const cartItems = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQty = useCartStore((state) => state.updateQty);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const setCart = useCartStore((state) => state.setCart);

  // Modal & loading states
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<'checkout' | 'bulk' | null>(null);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Restore pendingCart from localStorage after sign-in
  useEffect(() => {
    try {
      const pendingCartRaw = localStorage.getItem('pendingCart');
      if (user && pendingCartRaw) {
        const parsed = JSON.parse(pendingCartRaw) as CartItem[] | undefined;
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof setCart === 'function') {
            setCart(parsed);
            toast.success('Restored your saved cart after signing in');
          }
        }
        localStorage.removeItem('pendingCart');
      }
    } catch (err) {
      console.warn('Error restoring pendingCart', err);
    }
  }, [user, setCart]);

  // Handle pending checkout after login
  useEffect(() => {
    if (!user) return;
    try {
      const pending = localStorage.getItem('pendingCheckout');
      if (pending) {
        localStorage.removeItem('pendingCheckout');
        setTimeout(() => {
          navigate('/checkout');
        }, 250);
      }
    } catch (err) {
      console.warn('Error handling pendingCheckout', err);
    }
  }, [user, navigate]);

  // Open auth modal if user is not signed in
  const openAuthModal = (action: 'checkout' | 'bulk') => {
    setPendingAction(action);
    setModalOpen(true);
  };

  // Checkout button click
  const handleCheckout = () => {
    if (!user) {
      openAuthModal('checkout');
      return;
    }
    toast.success('Proceeding to checkout...');
    setTimeout(() => navigate('/checkout'), 400);
  };

  // Bulk quote button click
  const handleBulkQuote = () => {
    if (!user) {
      openAuthModal('bulk');
      return;
    }
    toast.success('Converting to bulk quote...');
    navigate('/bulk-quote');
  };

  // Handle sign-in from modal
  const handleSignInFromModal = () => {
    try {
      setIsLoading(true);
      localStorage.setItem(
        'pendingCheckout',
        JSON.stringify({ from: '/cart', action: pendingAction ?? 'checkout' })
      );
    } catch (err) {
      console.warn('Could not persist pendingCheckout', err);
    }

    setTimeout(() => {
      setIsLoading(false);
      setModalOpen(false);
      navigate('/auth', { state: { from: '/cart' } });
    }, 600);
  };

  // Empty cart view
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
              onClick={() =>
                navigate('/products', { state: { skipHero: true, scrollToTabs: true } })
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
    <AnimatePresence>
      <Header />
      <motion.div
        className="min-h-screen flex flex-col pb-32"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <main className="flex-1 container mx-auto px-2 py-4 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-md p-3 flex flex-row items-center gap-3"
                >
                  {/* Product image */}
                  <div className="w-24 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded border"
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ₵{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <Trash2
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => removeFromCart(item.id)}
                      />
                    </div>

                    {/* Pack & qty controls */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Pack size dropdown */}
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={item.pack || 12}
                          onChange={(e) => {
                            const newPack = Number(e.target.value);
                            const updated = cartItems.map((c) =>
                              c.id === item.id ? { ...c, pack: newPack } : c
                            );
                            setCart(updated);
                          }}
                        >
                          <option value={6}>6</option>
                          <option value={12}>12</option>
                          <option value={24}>24</option>
                        </select>

                        {/* Number of packs input */}
                        <p className="text-xs">qty:</p>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = Math.max(1, Number(e.target.value));
                            updateQty(item.id, newQty);
                          }}
                          className="border px-2 py-1 w-16 text-center rounded text-sm"
                        />
                      </div>

                      {/* Total price per item */}
                      <div className="text-right min-w-[80px]">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-heading font-semibold text-sm">
                          ₵{((item.price || 0) * (item.pack || 12) * (item.qty || 1)).toFixed(2)}
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

        {/* Sticky subtotal card at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full bg-white backdrop-blur-md border-t border-border shadow-lg">
          <div className="w-full max-w-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-8">
              <span className="text-lg font-heading font-extrabold text-black text-pretty">
                Subtotal
              </span>
              <span className="font-heading font-bold text-md">
                ₵{totalPrice().toFixed(2)}
              </span>
            </div>
            <Button size="md" onClick={handleCheckout} className="w-full sm:w-auto">
              Proceed to Checkout
            </Button>
          </div>
        </div>

        {/* Modal for auth prompt */}
        <Modal
          isOpen={isModalOpen}
          title={
            pendingAction === 'checkout'
              ? 'Please sign in to continue to checkout'
              : 'Please sign in to request a bulk quote'
          }
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignInFromModal} disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {isLoading ? 'Redirecting...' : 'Sign In'}
              </Button>
            </>
          }
        >
          <p className="text-sm">
            You need to be signed in to{' '}
            {pendingAction === 'checkout'
              ? 'complete checkout'
              : 'request a bulk quote'}
            . Signing in lets you save orders, view order history and manage shipping/payment details.
          </p>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
}
