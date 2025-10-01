import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleCheckout = () => {
    toast.success('Proceeding to checkout...');
   
  };

  const handleBulkQuote = () => {
    toast.success('Converting to bulk quote...');
    navigate('/bulk-quote');
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
            <Button variant="hero" size="lg" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-heading font-bold text-4xl mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-card border-2 border-border rounded-xl p-6">
                {/* Cart item content would go here */}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border-2 border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-heading font-bold text-2xl mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₵0.00</span>
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
                  <span className="font-heading font-bold text-xl">Total</span>
                  <span className="font-heading font-bold text-2xl">₵0.00</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Button variant="bulk" className="w-full" size="lg" onClick={handleBulkQuote}>
                  <Package className="h-5 w-5 mr-2" />
                  Convert to Bulk Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
