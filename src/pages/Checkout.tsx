"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useCartStore, CartItem } from "@/store/cartStore"
import { CheckCircle, ChevronDownIcon } from "lucide-react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { zones } from "@/data/zones"
import { useAuth } from "@/context/Authcontext";


interface Calendar24Props {
  date?: Date
  time?: string
  onDateChange?: (date: Date) => void
  onTimeChange?: (time: string) => void
}

export function Calendar24({ date: propDate, time: propTime, onDateChange, onTimeChange }: Calendar24Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(propDate)
  const [time, setTime] = useState<string>(propTime || "")

  useEffect(() => setDate(propDate), [propDate])
  useEffect(() => setTime(propTime || "10:30:00"), [propTime])

  return (
    <div className="flex gap-4 mt-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date-picker" className="w-32 justify-between font-normal">
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="center">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(selectedDate) => {
                setDate(selectedDate)
                onDateChange?.(selectedDate)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">Time</Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            onTimeChange?.(e.target.value)
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>
    </div>
  )
}

// ----------------------
// Radix Select (UI)
// ----------------------
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
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
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
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
))
SelectItem.displayName = "SelectItem"

// ----------------------
// Checkout
// ----------------------
export default function Checkout(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate()
  const cart = useCartStore((s) => s.cart) as CartItem[]
  const totalPrice = useCartStore((s) => s.totalPrice) as () => number
  const clearCart = useCartStore((s) => s.clearCart) as () => void

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Ghana",
    country: "Ghana",
    orderType: "delivery",
    paymentMethod: "card",
    deliveryDate: undefined as Date | undefined,
    deliveryTime: "",
  })
  const [shippingFee, setShippingFee] = useState(0)

  useEffect(() => {
    if (cart.length === 0) navigate("/cart")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [cart, navigate])

  useEffect(() => {
    const zone = zones.find((z) => z.name.toLowerCase() === formData.city.toLowerCase())
    setShippingFee(zone ? zone.fee : 0)
  }, [formData.city])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateOrderId = () => "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!formData.fullName || !formData.email || !formData.address || !formData.city) {
    toast.error("Please fill all required fields");
    return;
  }

  const finalTotal = totalPrice() + shippingFee;
  const orderId = generateOrderId();

  // Get cart directly from Zustand
  const currentCart = useCartStore.getState().cart; // <-- this is the live cart from Zustand
  if (!currentCart || currentCart.length === 0) {
    toast.error("Your cart is empty");
    return;
  }

  // Format cart if needed
  const formattedCart = currentCart.map((item) => ({
    productId: item.id, // match backend schema
    qty: item.qty,
  }));

  // Delivery payment
  if (formData.paymentMethod === "delivery") {
    try {
      await axios.post("http://localhost:5000/api/orders", {
        total: finalTotal,
        customer: formData,
        orderId,
        paymentMethod: "Pay on Delivery",
      });
      setShowConfirmation(true);
      clearCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save order");
    }
    return;
  }

  if (!user || !user.token) {
    toast.error("You must be logged in to pay with card");
    return;
  }

  try {
    const { data } = await axios.post(
      "https://duksshopback-end.onrender.com/api/payments/initialize",
      {
        amount: finalTotal * 100,
        email: formData.email,
        orderId,
        cart, // send cart directly from Zustand
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    window.location.href = data.authorization_url;
  } catch (err) {
    console.error(err);
    toast.error("Payment initialization failed");
  }
};



  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-sand px-4">
        <CheckCircle className="h-20 w-20 text-accent mb-6 animate-float" />
        <h1 className="text-3xl font-heading font-bold mb-2">Order Confirmed</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Thank you for your purchase. We’re processing your order and will contact you soon.
        </p>
        <Button size="lg" onClick={() => navigate("/products")}>Continue Shopping</Button>
      </div>
    )
  }

  const subtotal = totalPrice()
  const grandTotal = subtotal + shippingFee

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container py-16 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 rounded space-y-6">
            <h2 className="font-heading text-2xl font-bold mb-6 text-center">Checkout</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <Label>City / Zone</Label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select your area</option>
                  {zones.map((z) => (
                    <option key={z.name} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Label>Address</Label>
              <Input
                name="address"
                placeholder="14 Mango Street, East Legon"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            {formData.orderType === "delivery" && (
              <Calendar24
                date={formData.deliveryDate}
                time={formData.deliveryTime}
                onDateChange={(date) => setFormData((p) => ({ ...p, deliveryDate: date }))}
                onTimeChange={(time) => setFormData((p) => ({ ...p, deliveryTime: time }))}
              />
            )}

            <Button type="submit" size="md" className="w-full mt-4">
              Confirm & Place Order
            </Button>
          </form>

          {/* Right summary - centered */}
          <div className="flex justify-center lg:items-start">
            <aside className="w-full max-w-sm border rounded-2xl p-4 bg-card shadow-sm h-fit">
              <h3 className="font-heading font-bold text-lg mb-3 text-center lg:text-left">Order Summary</h3>

              {/* Total items selected */}
              <div className="flex justify-between text-sm mb-4">
                <span className="font-medium">ITEMS SELECTED:</span>
                <span className="font-semibold">{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₵{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₵{shippingFee.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold mt-2 text-base"><span>Total</span><span>₵{grandTotal.toFixed(2)}</span></div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
