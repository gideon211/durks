"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShimmerBar } from "@/components/ui/shimmer-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  RefreshCw,
  Search,
  Mail,
  ShoppingCart,
  LogIn,
  UserPlus,
  Eye,
  Activity,
  Users,
  CalendarDays,
  Clock,
  ShoppingBag,
  Trash2,
  PackagePlus,
  Download,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import axiosInstance from "@/api/axios";
import { useActivityLogs, useActivityActions, useActivityStats } from "@/admin/queries";

interface ActivityEntry {
  _id: string;
  user?: { _id: string; username: string; email: string } | null;
  email: string | null;
  action: string;
  details: string;
  createdAt: string;
  ip: string | null;
  isAdmin: boolean;
  route: string | null;
  method: string | null;
}

interface ActivityStats {
  totalActivities: number;
  uniqueCustomers: number;
  thisWeek: number;
  today: number;
  thisMonth: number;
  actionBreakdown: { action: string; count: number }[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  signup: { label: "Account Created", icon: "user-plus" },
  login: { label: "Logged In", icon: "log-in" },
  order_placed: { label: "Order Placed", icon: "shopping-cart" },
  add_to_cart: { label: "Added to Cart", icon: "shopping-bag" },
  remove_from_cart: { label: "Removed from Cart", icon: "trash-2" },
  clear_cart: { label: "Cart Cleared", icon: "trash-2" },
  update_cart: { label: "Cart Updated", icon: "package-plus" },
  update_cart_quantity: { label: "Updated Quantity", icon: "package-plus" },
  update_cart_pack: { label: "Changed Pack Size", icon: "package-plus" },
  admin_view_activity: { label: "Admin Viewed Activity", icon: "eye" },
  create_drink: { label: "Drink Created", icon: "package-plus" },
  update_drink: { label: "Drink Updated", icon: "package-plus" },
  delete_drink: { label: "Drink Deleted", icon: "trash-2" },
  update_order_status: { label: "Order Status Changed", icon: "package-plus" },
  cancel_order: { label: "Order Cancelled", icon: "trash-2" },
  delete_order: { label: "Order Deleted", icon: "trash-2" },
  batch_delete_orders: { label: "Orders Batch Deleted", icon: "trash-2" },
  delete_customer: { label: "Customer Deleted", icon: "trash-2" },
  batch_delete_customers: { label: "Customers Batch Deleted", icon: "trash-2" },
  delete_user: { label: "User Deleted", icon: "trash-2" },
  batch_delete_users: { label: "Users Batch Deleted", icon: "trash-2" },
  create_inventory: { label: "Inventory Created", icon: "package-plus" },
  update_inventory: { label: "Inventory Updated", icon: "package-plus" },
  delete_inventory: { label: "Inventory Deleted", icon: "trash-2" },
  update_quote_status: { label: "Quote Status Changed", icon: "package-plus" },
  delete_quote: { label: "Quote Deleted", icon: "trash-2" },
  update_preorder_status: { label: "Preorder Status Changed", icon: "package-plus" },
  delete_preorder: { label: "Preorder Deleted", icon: "trash-2" },
  create_training: { label: "Training Created", icon: "package-plus" },
  update_training: { label: "Training Updated", icon: "package-plus" },
  delete_training: { label: "Training Deleted", icon: "trash-2" },
  mark_notification_read: { label: "Notification Read", icon: "eye" },
  mark_all_notifications_read: { label: "All Notifications Read", icon: "eye" },
  delete_notification: { label: "Notification Deleted", icon: "trash-2" },
  checkout_started: { label: "Checkout Started", icon: "shopping-cart" },
  order_created: { label: "Order Created", icon: "shopping-cart" },
  contact_submitted: { label: "Contact Form", icon: "mail" },
  admin_export_activity: { label: "Activity Exported", icon: "download" },
  admin_verify_activity: { label: "Integrity Verified", icon: "shield-check" },
  api_error: { label: "API Error", icon: "shield-alert" },
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "user-plus": UserPlus,
  "log-in": LogIn,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "trash-2": Trash2,
  eye: Eye,
  mail: Mail,
  download: Download,
  "package-plus": PackagePlus,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
};

const ACTION_COLORS: Record<string, string> = {
  signup: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  login: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  order_placed: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  add_to_cart: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  remove_from_cart: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  view_cart: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  update_cart_quantity: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  update_cart_pack: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  checkout_started: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  order_created: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  contact_submitted: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  admin_export_activity: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  admin_verify_activity: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  api_error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  admin_view_activity: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

const STAT_CARD_COLORS: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
  totalActivities: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
  },
  uniqueCustomers: {
    bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    iconBg: "bg-green-500",
    iconColor: "text-white",
  },
  thisWeek: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
  },
  today: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
    iconBg: "bg-purple-500",
    iconColor: "text-white",
  },
};

function getActionMeta(action: string) {
  const meta = ACTION_LABELS[action];
  return {
    label: meta?.label ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: ACTION_ICONS[meta?.icon ?? ""] ?? History,
    color: ACTION_COLORS[action] ?? "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <Card className={`shadow-sm border-0 ${color}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ActivityLog() {
  const [searchEmail, setSearchEmail] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    checked: number;
    brokenAt?: string;
    error?: string;
  } | null>(null);

  const { data: logsData, isLoading, refetch: refetchLogs } = useActivityLogs({
    email: searchEmail || undefined,
    action: actionFilter === "all" ? undefined : actionFilter,
    from: fromDate || undefined,
    to: toDate || undefined,
    page,
    limit: 50,
  });
  const { data: actionsData } = useActivityActions();
  const { data: statsData, refetch: refetchStats } = useActivityStats();

  const logs = (logsData?.logs ?? []) as ActivityEntry[];
  const totalPages = logsData?.pages ?? 1;
  const actions = actionsData?.actions ?? [];
  const stats = (statsData?.stats ?? null) as ActivityStats | null;
  const loading = isLoading;

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [searchEmail, actionFilter, fromDate, toDate]);

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {};
      if (searchEmail) params.email = searchEmail;
      if (actionFilter !== "all") params.action = actionFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const { data } = await axiosInstance.get("/activity-logs/export", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { data } = await axiosInstance.get("/activity-logs/verify");
      setVerifyResult(data);
    } catch {
      setVerifyResult({ valid: false, checked: 0, error: "Verify request failed" });
    } finally {
      setVerifying(false);
    }
  };

  function handleRefresh() {
    refetchLogs();
    refetchStats();
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">Activity Log</h1>
            <p className="text-muted-foreground mt-1">Audit trail — who did what and when (customers & admins)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifying}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              {verifying ? "Verifying..." : "Verify Integrity"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {verifyResult && (
          <div
            className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${
              verifyResult.valid
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
            }`}
          >
            {verifyResult.valid ? (
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>
              {verifyResult.valid
                ? `Audit chain intact — ${verifyResult.checked.toLocaleString()} entries verified`
                : `Integrity check failed after ${verifyResult.checked.toLocaleString()} entries${
                    verifyResult.brokenAt ? ` (at ${verifyResult.brokenAt})` : ""
                  }${verifyResult.error ? `: ${verifyResult.error}` : ""}`}
            </span>
          </div>
        )}

        {/* Stats Cards */}
        {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Activities"
              value={stats.totalActivities.toLocaleString()}
              subtitle="All time"
              icon={Activity}
              color={STAT_CARD_COLORS.totalActivities.bg}
            />
            <StatCard
              title="Unique Customers"
              value={stats.uniqueCustomers.toLocaleString()}
              subtitle="Distinct emails"
              icon={Users}
              color={STAT_CARD_COLORS.uniqueCustomers.bg}
            />
            <StatCard
              title="This Week"
              value={stats.thisWeek.toLocaleString()}
              subtitle="Last 7 days"
              icon={CalendarDays}
              color={STAT_CARD_COLORS.thisWeek.bg}
            />
            <StatCard
              title="Today"
              value={stats.today.toLocaleString()}
              subtitle={new Date().toLocaleDateString("en-GB")}
              icon={Clock}
              color={STAT_CARD_COLORS.today.bg}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted/10 rounded-xl p-4 md:p-5">
                <ShimmerBar className="h-4 w-3/4 mb-3" />
                <ShimmerBar className="h-8 w-1/2 mb-2" />
                <ShimmerBar className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Action Breakdown */}
        {stats && stats.actionBreakdown.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Actions Breakdown
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.actionBreakdown.map((item) => {
                  const meta = getActionMeta(item.action);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={item.action}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${meta.color}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{meta.label}</span>
                      <span className="font-bold tabular-nums">{item.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {getActionMeta(a).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                aria-label="From date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full sm:w-40"
              />
              <Input
                type="date"
                aria-label="To date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full sm:w-40"
              />
              <Button onClick={() => setPage(1)} className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="bg-muted/10 rounded-xl p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <ShimmerBar className="h-8 w-8 rounded-full shrink-0" />
                <ShimmerBar className="h-4 w-full sm:w-20" />
                <ShimmerBar className="h-4 w-full sm:w-36" />
                <ShimmerBar className="h-4 w-full sm:w-24" />
                <ShimmerBar className="h-4 w-full sm:w-48" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden min-w-0">
              <div className="w-full overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Time</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Actor</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Role</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Action</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Endpoint</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Details</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted-foreground py-12">No activity found</td>
                    </tr>
                  ) : (
                    logs.map((entry) => {
                      const meta = getActionMeta(entry.action);
                      const Icon = meta.icon;
                      const actorName = entry.user?.username || entry.email;
                      return (
                        <tr key={entry._id} className="border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                            {new Date(entry.createdAt).toLocaleDateString("en-GB")}{" "}
                            {new Date(entry.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium whitespace-nowrap">{actorName ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                entry.isAdmin
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              }`}
                            >
                              {entry.isAdmin ? "Admin" : "Customer"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">
                            {entry.method && entry.route ? `${entry.method} ${entry.route}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.details || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{entry.ip || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
  );
}
