"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axiosInstance from "@/api/axios";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import Image from "next/image";
import { useCartStore, CartItem } from "@/store/cartStore";
import {
  CheckCircle,
  Loader2,
  ChevronDownIcon,
  ChevronUpIcon,
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
import { promoDeliveryWindow } from "@/lib/christmasPromo";

interface Calendar24Props {
  date?: Date;
  time?: string;
  onDateChange?: (date: Date) => void;
  onTimeChange?: (time: string) => void;
  errorDate?: string;
  errorTime?: string;
  touchedDate?: boolean;
  touchedTime?: boolean;
}

function Calendar24({
  date: propDate,
  time: propTime,
  onDateChange,
  onTimeChange,
  errorDate,
  errorTime,
  touchedDate,
  touchedTime,
}: Calendar24Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(propDate);
  const [time, setTime] = useState<string>(propTime || "");

  const promoWindow = useMemo(() => promoDeliveryWindow(), []);

  useEffect(() => setDate(propDate), [propDate]);
  useEffect(() => setTime(propTime || "10:30:00"), [propTime]);

  return (
    <div className="flex gap-4 mt-4">
      <div className="flex flex-col gap-3" data-error={errorDate && touchedDate ? "true" : undefined}>
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className={`w-32 justify-between font-normal h-12 ${touchedDate && errorDate ? "border-red-400" : ""}`}
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
              disabled={
                promoWindow
                  ? { before: promoWindow.from, after: promoWindow.to }
                  : { before: new Date(new Date().setHours(0, 0, 0, 0)) }
              }
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                onDateChange?.(selectedDate);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <FieldError error={errorDate} touched={touchedDate} />
      </div>

      <div className="flex flex-col gap-3" data-error={errorTime && touchedTime ? "true" : undefined}>
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
          className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none ${touchedTime && errorTime ? "border-red-400" : ""}`}
        />
        <FieldError error={errorTime} touched={touchedTime} />
      </div>
    </div>
  );
}

function FieldError({ error, touched }: { error?: string; touched?: boolean }) {
  if (!error || !touched) return null;
  return (
    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
      {error}
    </p>
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

type FormErrors = Partial<Record<keyof typeof INITIAL_FORM, string>>;

const INITIAL_FORM = {
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
};

export default function Checkout(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const distinctItemsCount = useCartStore((s) => s.distinctItems());

  const cart = useCartStore((s) => s.cart) as CartItem[];
  const clearCart = useCartStore((s) => s.clearCart) as () => void;
  const fetchCart = useCartStore((s) => s.fetchCart) as () => Promise<void>;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof INITIAL_FORM, boolean>>>({});

  const validate = useMemo(() => {
    return (data: typeof INITIAL_FORM): FormErrors => {
      const errs: FormErrors = {};
      const name = String(data.fullName || "").trim();
      const email = String(data.email || "").trim();
      const phone = String(data.phone || "").trim();
      const address = String(data.address || "").trim();
      const city = String(data.city || "").trim();

      if (!name) errs.fullName = "Full name is required";
      if (!email) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";
      if (!phone) errs.phone = "Phone number is required";
      else if (!/^\d{9,10}$/.test(phone)) errs.phone = "Enter a valid phone number (9-10 digits)";
      if (!address) errs.address = "Delivery address is required";
      if (!city) errs.city = "City / Town is required";
      if (data.orderType === "delivery") {
        if (!data.deliveryDate) errs.deliveryDate = "Please select a delivery date";
        if (!data.deliveryTime) errs.deliveryTime = "Please select a delivery time";
      }
      return errs;
    };
  }, []);

  const clearError = (name: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof FormErrors];
      return next;
    });
  };

  const markTouched = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  useEffect(() => {
    if (cart.length === 0) router.push("/cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [cart, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    clearError(name);
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, phone: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    if (!name) return;
    markTouched(name);
    setErrors(validate(formData));
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

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      fullName: true, email: true, phone: true,
      address: true, city: true,
      deliveryDate: true, deliveryTime: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      const firstError = document.querySelector("[data-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const trimmedName = String(formData.fullName || "").trim();
    const trimmedEmail = String(formData.email || "").trim();
    const trimmedAddress = String(formData.address || "").trim();
    const trimmedCity = String(formData.city || "").trim();

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
            phone: "+233" + String(formData.phone || ""),
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
        phone: "+233" + String(formData.phone || ""),
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
          <Button size="lg" onClick={() => router.push("/products")}>
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
          <div className="flex justify-center lg:items-start lg:order-2">
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
                      onClick={() => router.push(`/products?product=${encodeURIComponent(item.name)}`)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors p-1 -mx-1"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                        <Image
                          src={item.image || ""}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
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
                    <>
                      <AnimatePresence initial={false}>
                        {showAllItems && (
                          <motion.div
                            key="expanded-items"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 pt-1">
                              {validCartItems.slice(3).map((item, idx) => (
                                <motion.div
                                  key={idx + 3}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.32, 0.72, 0, 1] }}
                                  onClick={() => router.push(`/products?product=${encodeURIComponent(item.name)}`)}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors p-1 -mx-1"
                                >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                                    <Image
                                      src={item.image || ""}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
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
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        type="button"
                        onClick={() => setShowAllItems(!showAllItems)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
                      >
                        {showAllItems ? (
                          <>
                            Show less
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            +{validCartItems.length - 3} more{" "}
                            {validCartItems.length - 3 === 1 ? "item" : "items"}
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </>
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

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6 lg:order-1"
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
                  <div className="space-y-2" data-error={errors.fullName ? "true" : undefined}>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      disabled={isProcessing}
                      className={`focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none ${touched.fullName && errors.fullName ? "border-red-400" : ""}`}
                    />
                    <FieldError error={errors.fullName} touched={touched.fullName} />
                  </div>
                  <div className="space-y-2" data-error={errors.email ? "true" : undefined}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      disabled={isProcessing}
                      className={`focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none ${touched.email && errors.email ? "border-red-400" : ""}`}
                    />
                    <FieldError error={errors.email} touched={touched.email} />
                  </div>
                  <div className="space-y-2" data-error={errors.phone ? "true" : undefined}>
                    <Label htmlFor="phone">Phone</Label>
                    <div className={`flex rounded-none border ${touched.phone && errors.phone ? "border-red-400" : "border-input"} bg-background focus-within:ring-0`}>
                      <span className="flex items-center pl-3 text-sm text-muted-foreground select-none border-r border-input pr-2">
                        +233
                      </span>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={isProcessing}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-none"
                      />
                    </div>
                    <FieldError error={errors.phone} touched={touched.phone} />
                  </div>
                  <div className="space-y-2" data-error={errors.city ? "true" : undefined}>
                    <Label htmlFor="city">City / Town</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Accra"
                      required
                      disabled={isProcessing}
                      className={`focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none ${touched.city && errors.city ? "border-red-400" : ""}`}
                    />
                    <FieldError error={errors.city} touched={touched.city} />
                  </div>
                </div>

                <div className="space-y-2" data-error={errors.address ? "true" : undefined}>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Street, landmark, digital address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={isProcessing}
                    className={`focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none ${touched.address && errors.address ? "border-red-400" : ""}`}
                  />
                  <FieldError error={errors.address} touched={touched.address} />
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
                  {promoDeliveryWindow()
                    ? "Christmas preorders deliver between 1 and 31 December."
                    : "Pick a convenient date and time for your delivery"}
                </p>
                <Calendar24
                  date={formData.deliveryDate}
                  time={formData.deliveryTime}
                  onDateChange={(date) => {
                    setFormData((p) => ({ ...p, deliveryDate: date }));
                    clearError("deliveryDate");
                    markTouched("deliveryDate");
                  }}
                  onTimeChange={(time) => {
                    setFormData((p) => ({ ...p, deliveryTime: time }));
                    clearError("deliveryTime");
                    markTouched("deliveryTime");
                  }}
                  errorDate={errors.deliveryDate}
                  errorTime={errors.deliveryTime}
                  touchedDate={touched.deliveryDate}
                  touchedTime={touched.deliveryTime}
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
