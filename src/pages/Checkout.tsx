import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import { useCartStore, CartItem } from "@/store/cartStore";
import {
  CheckCircle,
  Loader2,
  ChevronDownIcon,

  ShoppingBag,
  MapPin,
  Clock,
  User,
  Package,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/context/Authcontext";
import { Modal } from "@/components/Modal";

interface Calendar24Props {
  date?: Date;
  time?: string;
  onDateChange?: (date: Date) => void;
  onTimeChange?: (time: string) => void;
}

function Calendar24({
  date: propDate,
  time: propTime,
  onDateChange,
  onTimeChange,
}: Calendar24Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(propDate);
  const [time, setTime] = useState<string>(propTime || "");

  useEffect(() => setDate(propDate), [propDate]);
  useEffect(() => setTime(propTime || "10:30:00"), [propTime]);

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
              className="w-32 justify-between font-normal h-12"
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
                setDate(selectedDate);
                onDateChange?.(selectedDate);
                setOpen(false);
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
            setTime(e.target.value);
            onTimeChange?.(e.target.value);
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
        />
      </div>
    </div>
  );
}

function CheckoutStepper({ currentStep }: { currentStep: number }) {
  const steps = ["Cart", "Checkout", "Confirmation"];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block transition-colors ${
                index <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-16 rounded-full transition-colors ${
                index < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Checkout(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const distinctItemsCount = useCartStore((s) => s.distinctItems());

  const cart = useCartStore((s) => s.cart) as CartItem[];
  const clearCart = useCartStore((s) => s.clearCart) as () => void;
  const fetchCart = useCartStore((s) => s.fetchCart) as () => Promise<void>;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Ghana",
    orderType: "delivery",
    paymentMethod: "card",
    deliveryDate: undefined as Date | undefined,
    deliveryTime: "",
  });

  useEffect(() => {
    if (cart.length === 0) navigate("/cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cart, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () =>
    "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  const validCartItems = useMemo(() => {
    return cart.map((item) => {
      const price = Number(item.price ?? 0);
      const qty = Number(item.qty ?? 1);
      return {
        drinkId: item.drinkId || item.id,
        name: item.name ?? "Item",
        price,
        quantity: qty,
        pack: item.pack ?? null,
        image: item.image ?? "",
        total: price * qty,
      };
    });
  }, [cart]);

  const itemsTotal = useMemo(() => {
    return validCartItems.reduce(
      (s, it) => s + (Number(it.total) || 0),
      0
    );
  }, [validCartItems]);

  const finalTotal = itemsTotal;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedCity = String(formData.city || "").trim();
    const trimmedName = String(formData.fullName || "").trim();
    const trimmedEmail = String(formData.email || "").trim();
    const trimmedAddress = String(formData.address || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedAddress || !trimmedCity) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.orderType === "delivery") {
      if (!formData.deliveryDate) {
        toast.error("Please select a delivery date");
        return;
      }
      if (!formData.deliveryTime) {
        toast.error("Please select a delivery time");
        return;
      }
    }

    try {
      setIsProcessing(true);

      await fetchCart();
      const latestCart = useCartStore.getState().cart as CartItem[];

      if (!latestCart || latestCart.length === 0) {
        toast.error("Your cart is empty");
        setIsProcessing(false);
        return;
      }

      const authoritativeItems = latestCart.map((item) => {
        const quantity = Number(item.qty ?? 1);
        const packPrice = Number(item.price ?? 0);
        return {
          drinkId: item.drinkId || item.id,
          name: item.name ?? "Item",
          pack: item.pack ?? null,
          packPrice,
          quantity,
          image: item.image ?? "",
          total: packPrice * quantity,
        };
      });

      const authoritativeItemsTotal = authoritativeItems.reduce(
        (s, it) => s + Number(it.total || 0),
        0
      );
      const authoritativeFinalTotal = authoritativeItemsTotal;

      const orderId = generateOrderId();

      if (formData.paymentMethod === "delivery") {
        await axiosInstance.post("/orders", {
          totalAmount: authoritativeFinalTotal,
          customer: {
            fullName: trimmedName,
            email: trimmedEmail,
            phone: String(formData.phone || ""),
            address: trimmedAddress,
            city: trimmedCity,
            country: formData.country || "Ghana",
            deliveryDate: formData.deliveryDate || null,
            deliveryTime: formData.deliveryTime || null,
          },
          orderId,
          paymentMethod: "Pay on Delivery",
          items: authoritativeItems.map((it) => ({
            drinkId: it.drinkId,
            name: it.name,
            pack: it.pack,
            price: it.packPrice,
            quantity: it.quantity,
            total: it.total,
            image: it.image,
          })),
          deliveryDate: formData.deliveryDate?.toISOString() || "",
          deliveryTime: formData.deliveryTime || "",
        });

        setShowConfirmation(true);
        await clearCart();
        setIsProcessing(false);
        return;
      }

      if (!user || !user.token) {
        toast.error("You must be logged in to pay with card");
        setIsProcessing(false);
        return;
      }

      setIsRedirectModalOpen(true);

      const userId = user.id;
      const metadataItems = authoritativeItems.map((it) => ({
        drinkId: it.drinkId,
        name: it.name,
        pack: it.pack,
        price: it.packPrice,
        quantity: it.quantity,
        total: it.total,
        image: it.image,
      }));

      const customerObj = {
        fullName: trimmedName,
        email: trimmedEmail || user.email,
        phone: String(formData.phone || ""),
        address: trimmedAddress,
        city: trimmedCity,
        country: formData.country || "Ghana",
        deliveryDate: formData.deliveryDate || null,
        deliveryTime: formData.deliveryTime || null,
      };

      const payload = {
        email: customerObj.email,
        fullName: customerObj.fullName,
        phone: customerObj.phone,
        city: customerObj.city,
        address: customerObj.address,
        deliveryDate: customerObj.deliveryDate,
        deliveryTime: customerObj.deliveryTime,
        amount: Math.round(authoritativeFinalTotal * 100),
        provider: "Paystack",
        metadata: {
          userId,
          customer: customerObj,
          items: metadataItems,
          itemsTotal: authoritativeItemsTotal,
          finalTotal: authoritativeFinalTotal,
          deliveryDate: formData.deliveryDate?.toISOString() || "",
          deliveryTime: formData.deliveryTime || "",
        },
      };

      const { data } = await axiosInstance.post(
        "/payments/initialize",
        payload
      );

      setIsRedirectModalOpen(false);
      setIsProcessing(false);

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.error("Payment initialization failed");
      }
    } catch {
      toast.error("Failed to process order");
      setIsRedirectModalOpen(false);
      setIsProcessing(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">
            Order Confirmed
          </h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
            Thank you for your purchase. We are processing your order and will
            contact you soon.
          </p>
          <Button size="lg" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  const itemsCount = cart.reduce(
    (sum, item) => sum + (Number(item.qty ?? 1) || 0),
    0
  );

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <CheckoutStepper currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={isProcessing}
                      className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isProcessing}
                      className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isProcessing}
                      className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City / Town</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Accra"
                      required
                      disabled={isProcessing}
                      className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street, landmark, digital address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={isProcessing}
                    className="focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Pick a convenient date and time for your delivery
                </p>
                <Calendar24
                  date={formData.deliveryDate}
                  time={formData.deliveryTime}
                  onDateChange={(date) =>
                    setFormData((p) => ({ ...p, deliveryDate: date }))
                  }
                  onTimeChange={(time) =>
                    setFormData((p) => ({ ...p, deliveryTime: time }))
                  }
                />
              </CardContent>
            </Card>



            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm & Place Order"
              )}
            </Button>
          </form>

          <div className="flex justify-center lg:items-start">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {validCartItems.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.image || ""}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₵{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        ₵{item.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {validCartItems.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{validCartItems.length - 3} more{" "}
                      {validCartItems.length - 3 === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      ₵{itemsTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-xs text-accent">
                      Calculated at delivery
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-heading font-bold text-base">
                    Total
                  </span>
                  <span className="font-heading font-bold text-base">
                    ₵{finalTotal.toFixed(2)}
                  </span>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    Delivering to{" "}
                    <span className="font-semibold text-foreground">
                      {formData.city || "your area"}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isRedirectModalOpen}
        title="Please wait..."
        onClose={() => {}}
        footer={null}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">
            Redirecting to payment...
          </p>
        </div>
      </Modal>
    </motion.div>
  );
}
