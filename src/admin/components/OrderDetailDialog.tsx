"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Copy,
  Check,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export interface OrderItem {
  drinkId?: string;
  image?: string;
  name: string;
  pack?: string | number;
  price?: number;
  quantity?: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber?: string | null;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  items?: OrderItem[];
  totalAmount?: number;
  totalItems?: number;
  paymentStatus?: string;
  orderStatus?: string;
  paystackReference?: string;
  paymentMethod?: string;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
  createdAt?: string;
}

interface OrderDetailDialogProps {
  order: AdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkCompleted?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  updatingOrderId?: string | null;
}

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  refunded: "bg-slate-100 text-slate-600 border-slate-200",
};

const FULFILLMENT_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const METHOD_LABELS: Record<string, string> = {
  card: "Card",
  "mobile money": "Mobile Money",
  mobile_money: "Mobile Money",
  "cash on delivery": "Cash on Delivery",
  cod: "Cash on Delivery",
  transfer: "Bank Transfer",
  "bank transfer": "Bank Transfer",
  bank_transfer: "Bank Transfer",
  paystack: "Card",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB");
}

function formatTime(timeStr?: string | null) {
  if (!timeStr) return "\u2014";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function StatusPill({ value, styles }: { value?: string; styles: Record<string, string> }) {
  const v = String(value || "pending").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[v] || "bg-muted text-muted-foreground border-border"}`}>
      {v || "pending"}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy to clipboard"
      title={copied ? "Copied" : "Copy"}
      onClick={() => {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }).catch(() => {});
        }
      }}
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
        copied ? "text-emerald-600" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function OrderItemThumb({ item }: { item: OrderItem }) {
  const [imageError, setImageError] = useState(false);
  const { data: drink } = useQuery({
    queryKey: ["drink", item.drinkId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/drinks/${item.drinkId}`);
      return data?.drink as { imageUrl?: string } | undefined;
    },
    enabled: !!item.drinkId && !item.image,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const src = !imageError && (item.image || drink?.imageUrl);

  return (
    <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
      {src ? (
        <Image src={src} alt={item.name || "Product"} fill sizes="56px" className="object-cover" onError={() => setImageError(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500">
          <Package className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

export default function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onMarkCompleted,
  onCancelOrder,
  updatingOrderId = null,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const items = order.items ?? [];
  const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
  const total = Number(order.totalAmount ?? subtotal) || 0;

  const customer = order.customer ?? {};
  const fullName = customer.fullName?.trim() || customer.email || "Unknown";
  const initial = (fullName.charAt(0) || "?").toUpperCase();
  const reference = String(order.paystackReference || "");
  const methodLabel = METHOD_LABELS[String(order.paymentMethod || "").toLowerCase()] || order.paymentMethod || (reference.startsWith("COD-") ? "Cash on Delivery" : "Card");

  const isDone = ["completed", "delivered", "cancelled"].includes(String(order.orderStatus || "").toLowerCase());
  const isUpdating = updatingOrderId === order._id;

  const placed = order.createdAt
    ? `Placed ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} · ${new Date(order.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" })}`
    : "Placed \u2014";

  const addressLine =
    customer.address && customer.address !== "Not provided"
      ? [customer.address, customer.city, customer.country].filter(Boolean).join(", ")
      : [customer.city, customer.country].filter(Boolean).join(", ") || "\u2014";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl lg:max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl" style={{ maxHeight: "90vh" }}>
        <div className="flex max-h-[90vh] flex-col">
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Order</p>
              <div className="flex items-center gap-1.5">
                <p className="truncate font-mono text-lg font-bold">{order.orderNumber || order._id?.slice(-10) || ""}</p>
                <CopyButton value={order.orderNumber || order._id} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{placed}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pr-10">
              <StatusPill value={order.paymentStatus} styles={PAYMENT_STYLES} />
              <StatusPill value={order.orderStatus} styles={FULFILLMENT_STYLES} />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Items */}
              <div className="rounded-2xl border border-border/50 bg-card lg:col-span-2">
                <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
                  <p className="text-xs text-muted-foreground">
                    {items.length} product{items.length !== 1 ? "s" : ""} · {totalQty} unit{totalQty !== 1 ? "s" : ""}
                  </p>
                </div>
                {items.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {items.map((it, idx) => {
                      const lineTotal = (Number(it.price) || 0) * (Number(it.quantity) || 1);
                      return (
                        <div key={idx} className="flex items-center gap-3 px-5 py-3">
                          <OrderItemThumb item={it} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium break-words">{it.name || "Item"}</p>
                            <div className="mt-1 grid max-w-xs grid-cols-3 gap-3">
                              <Spec label="Pack" value={it.pack != null && String(it.pack).trim() !== "" ? String(it.pack) : "\u2014"} />
                              <Spec label="Qty" value={String(Number(it.quantity) || 1)} />
                              <Spec label="Unit" value={`GH₵${(Number(it.price) || 0).toFixed(2)}`} />
                            </div>
                          </div>
                          <p className="shrink-0 text-sm font-semibold tabular-nums">GH₵{lineTotal.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-5 py-6 text-sm text-muted-foreground">No items on this order.</p>
                )}
                <div className="space-y-1.5 border-t border-border/40 px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-muted-foreground">Calculated at delivery</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-2">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-lg font-extrabold tabular-nums">GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Side panel */}
              <div className="space-y-5">
                {/* Customer */}
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{initial}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{fullName}</p>
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 truncate text-xs text-muted-foreground hover:text-primary">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </a>
                      )}
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 truncate text-xs text-muted-foreground hover:text-primary">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Delivery</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{addressLine}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDate(order.deliveryDate)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatTime(order.deliveryTime)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4 shrink-0" />
                        <span className="truncate">{methodLabel}</span>
                      </span>
                      <StatusPill value={order.paymentStatus} styles={PAYMENT_STYLES} />
                    </div>
                    {reference && (
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5">
                        <span className="truncate font-mono text-xs text-muted-foreground">{reference}</span>
                        <CopyButton value={reference} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-xl font-extrabold tabular-nums">GH₵{total.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700" disabled={isDone || isUpdating} onClick={() => onCancelOrder?.(order._id)}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cancel Order
              </Button>
              <Button size="sm" className="rounded-xl" disabled={isDone || isUpdating} onClick={() => onMarkCompleted?.(order._id)}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Mark Delivered
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
