import React, { useState, useEffect } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import axiosInstance from "@/api/axios";

interface ActivityEntry {
  _id: string;
  user?: { _id: string; username: string; email: string } | null;
  email: string | null;
  action: string;
  details: string;
  createdAt: string;
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
  view_cart: { label: "Viewed Cart", icon: "eye" },
  update_cart_quantity: { label: "Updated Quantity", icon: "package-plus" },
  update_cart_pack: { label: "Changed Pack Size", icon: "package-plus" },
  admin_view_activity: { label: "Admin Viewed Activity", icon: "eye" },
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "user-plus": UserPlus,
  "log-in": LogIn,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "trash-2": Trash2,
  eye: Eye,
  "package-plus": PackagePlus,
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
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actions, setActions] = useState<string[]>([]);

  const fetchActions = async () => {
    try {
      const { data } = await axiosInstance.get("/activity-logs/actions");
      if (data.success) setActions(data.actions);
    } catch {
      // ignore
    }
  };

  const fetchLogs = async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(p), limit: "50" };
      if (searchEmail) params.email = searchEmail;
      if (actionFilter !== "all") params.action = actionFilter;

      const { data } = await axiosInstance.get("/activity-logs", { params });
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pages);
        setPage(data.page);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get("/activity-logs/stats");
      if (data.success) setStats(data.stats);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchActions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs(1);
    setPage(1);
  }, [searchEmail, actionFilter]);

  function handleRefresh() {
    fetchStats();
    fetchLogs(page);
  }

  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">Activity Log</h1>
            <p className="text-muted-foreground mt-1">Track customer lifetime activity on the website</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

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
              <Card key={i} className="shadow-sm">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
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
            <div className="flex flex-col sm:flex-row gap-3">
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
              <Button onClick={() => fetchLogs(1)}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="rounded-lg border bg-card shadow-sm p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48 flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto rounded-lg border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Time</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Customer</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Action</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground py-12">No activity found</td>
                    </tr>
                  ) : (
                    logs.map((entry) => {
                      const meta = getActionMeta(entry.action);
                      const Icon = meta.icon;
                      return (
                        <tr key={entry._id} className="border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                            {new Date(entry.createdAt).toLocaleDateString("en-GB")}{" "}
                            {new Date(entry.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium">{entry.email ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.details || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchLogs(page + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
