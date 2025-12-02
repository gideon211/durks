// src/pages/Checkout.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCartStore, CartItem } from "@/store/cartStore";
import { CheckCircle, Loader2, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { zones } from "@/data/zones";
import { useAuth } from "@/context/Authcontext";
import { Modal } from "@/components/Modal";

interface Calendar24Props {
  date?: Date;
  time?: string;
  onDateChange?: (date: Date) => void;
  onTimeChange?: (time: string) => void;
}

export function Calendar24({ date: propDate, time: propTime, onDateChange, onTimeChange }: Calendar24Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(propDate);
  const [time, setTime] = useState<string>(propTime || "");

  useEffect(() => setDate(propDate), [propDate]);
  useEffect(() => setTime(propTime || "10:30:00"), [propTime]);

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
                setDate(selectedDate);
                onDateChange?.(selectedDate);
                setOpen(false);
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
            setTime(e.target.value);
            onTimeChange?.(e.target.value);
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </div>
    </div>
  );
}

export default function Checkout(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.cart) as CartItem[];
  const subtotalFn = useCartStore((s) => s.totalPrice) as () => number;
  const clearCart = useCartStore((s) => s.clearCart) as () => void;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

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
  });
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    if (cart.length === 0) navigate("/cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cart, navigate]);

  useEffect(() => {
    const zone = zones.find((z) => z.name.toLowerCase() === formData.city.toLowerCase());
    setShippingFee(zone ? zone.fee : 0);
  }, [formData.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () => "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const API_BASE = "https://duksshopback-end.onrender.com/api";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.address || !formData.city) {
      toast.error("Please fill all required fields");
      return;
    }

    const subtotal = subtotalFn();
    const finalTotal = subtotal + shippingFee;
    const orderId = generateOrderId();

    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // ✅ Normalize cart items
    const validCartItems = cart.map((item) => ({
      drinkId: item.drinkId || item.id,
      name: item.name || "Item",
      price: Number(item.price) || 0,
      quantity: Number(item.qty ?? 1),
      pack: item.pack ?? null,
      image: item.image || "",
    }));

    // Pay on Delivery
    if (formData.paymentMethod === "delivery") {
      try {
        setIsProcessing(true);
        await axios.post(
          `${API_BASE}/orders`,
          {
            totalAmount: finalTotal,
            customer: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              country: formData.country,
            },
            orderId,
            paymentMethod: "Pay on Delivery",
            items: validCartItems,
          },
          {
            headers: {
              Authorization: user?.token ? `Bearer ${user.token}` : undefined,
            },
          }
        );

        setShowConfirmation(true);
        await clearCart();
      } catch (err: any) {
        console.error("Pay on Delivery error:", err?.response?.data ?? err);
        toast.error("Failed to save order");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Card payment (Paystack)
    if (!user || !user.token) {
      toast.error("You must be logged in to pay with card");
      return;
    }

    try {
      setIsRedirectModalOpen(true);
      setIsProcessing(true);

      const userId = (user as any)?._id ?? (user as any)?.id ?? null;

      const payload: any = {
        email: formData.email || (user as any)?.email,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        amount: Math.round(finalTotal * 100),
        provider: "Paystack",
        metadata: {
          userId,
          email: formData.email || (user as any)?.email,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          provider: "Paystack",
          items: validCartItems,
          deliveryDate: formData.deliveryDate ? formData.deliveryDate.toISOString() : null,
          deliveryTime: formData.deliveryTime || null,
        },
      };

      const { data } = await axios.post(`${API_BASE}/payments/initialize`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setIsRedirectModalOpen(false);
      setIsProcessing(false);

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        console.error("Missing authorization_url:", data);
        toast.error("Payment initialization failed");
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err?.response?.data ?? err);
      toast.error("Payment initialization failed");
      setIsRedirectModalOpen(false);
      setIsProcessing(false);
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
    );
  }

  const subtotal = subtotalFn();
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container py-16 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 rounded space-y-6">
            <h2 className="font-heading text-2xl font-bold mb-6 text-center">Checkout</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} required disabled={isProcessing} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isProcessing} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} required disabled={isProcessing} />
              </div>
              <div>
                <Label>City / Zone</Label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={isProcessing}
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
                disabled={isProcessing}
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

            <Button type="submit" size="md" className="w-full mt-4" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                "Confirm & Place Order"
              )}
            </Button>
          </form>

          <div className="flex justify-center lg:items-start">
            <aside className="w-full max-w-sm border rounded-2xl p-4 bg-card shadow-sm h-fit">
              <h3 className="font-heading font-bold text-lg mb-3 text-center lg:text-left">Order Summary</h3>

              <div className="flex justify-between text-sm mb-4">
                <span className="font-medium">ITEMS SELECTED:</span>
                <span className="font-semibold">{cart.reduce((sum, item) => sum + (item.qty ?? 1), 0)}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₵{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping fee</span><span className="font-medium text-xs">UPON DELIVERY</span></div>
                <div className="flex justify-between font-bold mt-2 text-base"><span>Total</span><span>₵{grandTotal.toFixed(2)}</span></div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isRedirectModalOpen}
        title="Please wait…"
        onClose={() => {}}
        footer={null}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-center text-sm">Please wait.. redirecting to payment.</p>
        </div>
      </Modal>
    </div>
  );
}
