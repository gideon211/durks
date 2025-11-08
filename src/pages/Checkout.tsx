"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useCartStore, CartItem } from "@/store/cartStore"
import { CreditCard, Truck, CheckCircle, Phone } from "lucide-react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"

// ----------------------
// Calendar24 Component
// ----------------------
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

  useEffect(() => {
    setDate(propDate)
  }, [propDate])

  useEffect(() => {
    setTime(propTime || "10:30:00")
  }, [propTime])

  return (
    <div className="flex gap-4 mt-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal "
            >
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
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            onTimeChange?.(e.target.value)
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}

// ----------------------
// Radix Select Components
// ----------------------
const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
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
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
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
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
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
)
SelectItem.displayName = "SelectItem"

// ----------------------
// Checkout Form Types
// ----------------------
interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  orderType: string
  paymentMethod: string
  deliveryDate?: Date
  deliveryTime?: string
}

// ----------------------
// Checkout Component
// ----------------------
export default function Checkout(): JSX.Element {
  const navigate = useNavigate()
  const cart = useCartStore((state) => state.cart) as CartItem[]
  const totalPrice = useCartStore((state) => state.totalPrice) as () => number
  const clearCart = useCartStore((state) => state.clearCart) as () => void

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    orderType: "delivery",
    paymentMethod: "card",
    deliveryDate: undefined,
    deliveryTime: "",
  })

  useEffect(() => {
    if (cart.length === 0) navigate("/cart")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [cart, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateOrderId = () => {
    return "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email || !formData.address) {
      toast.error("Please fill all required fields")
      return
    }

    if (formData.paymentMethod === "delivery") {
      try {
        await axios.post("http://localhost:5000/api/orders", {
          cart,
          total: totalPrice() + 15,
          customer: formData,
          orderId: generateOrderId(),
          paymentMethod: "Pay on Delivery",
        })
        setShowConfirmation(true)
        clearCart()
      } catch (err) {
        console.error(err)
        toast.error("Failed to save order")
      }
      return
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/paystack/init", {
        amount: (totalPrice() + 15) * 100,
        email: formData.email,
        orderId: generateOrderId(),
      })
      window.location.href = data.authorization_url
    } catch (err) {
      console.error(err)
      toast.error("Payment initialization failed")
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft-sand px-4">
        <CheckCircle className="h-20 w-20 text-accent mb-6 animate-float" />
        <h1 className="text-3xl font-heading font-bold mb-2">Order Confirmed</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Thank you for your purchase. We’re processing your order and will contact you soon.
        </p>
        <Button size="lg" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 mt-14 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 rounded space-y-6">
            <h2 className="font-heading text-2xl font-semibold mb-4">Checkout</h2>

            {/* Order Type */}
            <div className="space-y-2">
              <Label>Order Type</Label>
              <SelectPrimitive.Root
                value={formData.orderType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, orderType: value }))
                }
              >
                <SelectTrigger>
                  <SelectPrimitive.Value placeholder="Delivery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </SelectPrimitive.Root>
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

            {/* Delivery Date & Time */}
            {formData.orderType === "delivery" && (
              <Calendar24
                date={formData.deliveryDate}
                time={formData.deliveryTime}
                onDateChange={(date) =>
                  setFormData((prev) => ({ ...prev, deliveryDate: date }))
                }
                onTimeChange={(time) =>
                  setFormData((prev) => ({ ...prev, deliveryTime: time }))
                }
              />
            )}

            {/* Payment Section */}


            <Button type="submit" size="md" className="w-full mt-4">
              Confirm & Place Order
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
