import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { CreditCard, Truck, CheckCircle, Phone } from "lucide-react";
import React from "react"


// Radix Select Imports
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Select Components
const Select = SelectPrimitive.Root;

const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary hover:bg-muted/50 transition-all",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none focus:bg-muted focus:text-foreground data-[state=checked]:font-semibold",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    orderType: "delivery",
    paymentMethod: "card",
  });

  useEffect(() => {
    if (cart.length === 0) navigate("/cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }

    toast.success("Processing order...");
    setTimeout(() => {
      setShowConfirmation(true);
      clearCart();
    }, 1200);
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-sand px-4">
        <CheckCircle className="h-20 w-20 text-accent mb-6 animate-float" />
        <h1 className="text-3xl font-heading font-bold mb-2">
          Order Confirmed
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Thank you for your purchase. We’re processing your order and will
          contact you soon.
        </p>
        <Button size="lg" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Billing form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-6"
          >
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-4">
                Checkout Details
              </h2>

              {/* Order Type using Radix Select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Order Type
                </label>
                <Select
                  value={formData.orderType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, orderType: value }))
                  }
                >
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="14 Mango Street, East Legon"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4">
                Payment Method
              </h2>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: val }))
                }
                className="space-y-3"
              >
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </Label>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="mobile" id="mobile" />
                  <Label htmlFor="mobile" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Money (MTN, AirtelTigo, Vodafone)
                  </Label>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Pay on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button size="lg" className="w-full mt-4">
              Confirm & Place Order
            </Button>
          </form>

          {/* RIGHT: Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-heading text-xl font-semibold mb-4 text-center">
              Order Slip
            </h2>

            <div className="border-t border-gray-300 w-full"></div>

            <div className="divide-y divide-border mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.qty}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    ₵{(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₵{totalPrice().toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>₵15.00</span>
              </div>

              <div className="flex justify-between font-bold border-t border-border pt-3 text-lg">
                <span>Total:</span>
                <span>₵{(totalPrice() + 15).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-muted-foreground text-center">
              You’ll receive an order confirmation email after payment.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
