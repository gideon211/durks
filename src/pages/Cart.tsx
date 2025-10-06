import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/store/cartStore'

export default function Cart() {
  const navigate = useNavigate()

  // Zustand store hooks
  const cartItems = useCartStore((state) => state.cart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQty = useCartStore((state) => state.updateQty)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const clearCart = useCartStore((state) => state.clearCart)

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCheckout = () => {
    toast.success('Proceeding to checkout...')
    // integrate backend checkout later
  }

  const handleBulkQuote = () => {
    toast.success('Converting to bulk quote...')
    navigate('/bulk-quote')
  }

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

        {/* <Footer /> */}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-6">Shopping Cart</h1>

        {/* Grid: items column (2 cols on lg) and summary column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list: spans 2/3 on large screens */}
          <div className="lg:col-span-2 space-y-4">
{cartItems.map((item) => (
  <div
    key={item.id}
    className="bg-card border border-border rounded-xl p-3 flex flex-row items-center gap-3"
  >
    {/* Image */}
    <div className="w-24 flex-shrink-0">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-24 object-cover rounded-md border"
      />
    </div>

    {/* Details */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            ₵{item.price.toFixed(2)} each
          </p>
        </div>

        {/* Remove button */}
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

      {/* Qty controls + item total */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            aria-label={`Decrease quantity for ${item.name}`}
            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
            className=""
          >
            <Minus className="" />
          </Button>

          <span className="px-2 py-2 rounded-md border border-border text-xs text-center min-w-[28px]">
            {item.qty}
          </span>

          <Button
            variant="outline"
            size="sm"
            aria-label={`Increase quantity for ${item.name}`}
            onClick={() => updateQty(item.id, item.qty + 1)}
            className=""
          >
            <Plus className="" />
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

          {/* Summary column */}
          <div>
            <div className="bg-card border border-border rounded-xl p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-bold text-2xl mb-4">Order Summary</h2>

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
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>

                {/* <Button
                  variant="bulk"
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                  onClick={handleBulkQuote}
                >
                  <Package className="h-5 w-5" />
                  Convert to Bulk Quote
                </Button> */}

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    clearCart()
                    toast.success('Cart cleared')
                  }}
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Small note or promo */}
            <div className="mt-4 text-xs text-muted-foreground">
              Need bulk pricing? Use the bulk quote option for discounts on large orders.
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  )
}
