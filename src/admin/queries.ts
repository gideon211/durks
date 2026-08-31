"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";

const STALE = 60 * 1000;

// ---------- Dashboard ----------

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  ordersToday: number;
  revenueToday: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  ordersThisWeek: number;
  revenueThisWeek: number;
  pendingOrders: number;
  statusBreakdown: Record<string, number>;
  repeatPurchaseRate: number;
  customerLifetimeValue: number;
  preorderCount: number;
  preorderRatio: number;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/orders/admin/dashboard");
      return data as {
        stats: DashboardStats;
        revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
        categories: Array<{ name: string; count: number }>;
        productCount: number;
        customerCount: number;
        recentOrders: unknown[];
      };
    },
    staleTime: STALE,
  });
}

// ---------- Orders ----------

export interface AdminOrdersParams {
  status?: string;
  payment?: string;
  search?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
}

export function useAdminOrders(params: AdminOrdersParams = {}) {
  const sp = new URLSearchParams();
  if (params.status && params.status !== "all") sp.set("status", params.status);
  if (params.payment && params.payment !== "all") sp.set("payment", params.payment);
  if (params.search) sp.set("search", params.search);
  if (params.dateRange && params.dateRange !== "all") sp.set("dateRange", params.dateRange);
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 50));
  const qs = sp.toString();

  return useQuery({
    queryKey: ["admin", "orders", qs],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/orders/admin/all?${qs}`);
      return data as { orders: unknown[]; total: number; page: number; pages: number };
    },
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });
}

// ---------- Payments ----------

export function usePayments(params: { page?: number; limit?: number; payment?: string; search?: string } = {}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 50));
  if (params.payment && params.payment !== "all") sp.set("payment", params.payment);
  if (params.search) sp.set("search", params.search);
  const qs = sp.toString();

  return useQuery({
    queryKey: ["admin", "payments", qs],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/orders/admin/payments?${qs}`);
      return data as { payments: unknown[]; total: number; page: number; pages: number };
    },
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });
}

// ---------- Customers ----------

export function useAdminCustomers(page = 1, limit = 100) {
  return useQuery({
    queryKey: ["admin", "customers", page, limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/orders/admin/customers?page=${page}&limit=${limit}`);
      return data as { customers: unknown[]; total: number; page: number; pages: number };
    },
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });
}

export function useCustomerCount() {
  return useQuery({
    queryKey: ["admin", "customersCount"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/orders/admin/customers?count=true");
      return data as { count: number };
    },
    staleTime: STALE,
  });
}

// ---------- Stats / analytics ----------

export function useOrderStats() {
  return useQuery({
    queryKey: ["admin", "orderStats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/orders/admin/stats");
      return data as { stats: DashboardStats };
    },
    staleTime: STALE,
  });
}

export function useRevenueTrend() {
  return useQuery({
    queryKey: ["admin", "revenueTrend"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/orders/admin/revenue-trend");
      return data as { trend: Array<{ date: string; revenue: number; orders: number }> };
    },
    staleTime: STALE,
  });
}

export function useCategoryStats() {
  return useQuery({
    queryKey: ["admin", "categoryStats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/drinks/stats/category");
      return data as { categories: Array<{ name: string; count: number }> };
    },
    staleTime: STALE,
  });
}

// ---------- Users ----------

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/users");
      return data as { users: unknown[] };
    },
    staleTime: STALE,
  });
}

export function useUsersCount() {
  return useQuery({
    queryKey: ["admin", "usersCount"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/users/count");
      return data as { count: number };
    },
    staleTime: STALE,
  });
}

// ---------- Products ----------

export function useProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/drinks/");
      return data as { drinks: unknown[]; count: number };
    },
    staleTime: STALE,
  });
}

// ---------- Activity log ----------

export function useActivityLogs(params: { email?: string; action?: string; from?: string; to?: string; page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.email) sp.set("email", params.email);
  if (params.action) sp.set("action", params.action);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 50));
  const qs = sp.toString();

  return useQuery({
    queryKey: ["admin", "activityLogs", qs],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/activity-logs?${qs}`);
      return data as { logs: unknown[]; total: number; page: number; pages: number };
    },
    staleTime: STALE,
    placeholderData: keepPreviousData,
  });
}

export function useActivityActions() {
  return useQuery({
    queryKey: ["admin", "activityActions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/activity-logs/actions");
      return data as { actions: string[] };
    },
    staleTime: STALE,
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: ["admin", "activityStats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/activity-logs/stats");
      return data as { stats: unknown };
    },
    staleTime: STALE,
  });
}

// ---------- Mutations ----------

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, orderStatus }: { id: string; orderStatus: string }) => {
      const { data } = await axiosInstance.patch(`/orders/admin/${id}/status`, { orderStatus });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.patch(`/orders/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/orders/admin/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      qc.invalidateQueries({ queryKey: ["admin", "customersCount"] });
    },
  });
}

export function useBatchDeleteOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await axiosInstance.post("/orders/admin/batch-delete", { ids });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      qc.invalidateQueries({ queryKey: ["admin", "customersCount"] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axiosInstance.delete(`/orders/admin/customer/${encodeURIComponent(email)}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      qc.invalidateQueries({ queryKey: ["admin", "customersCount"] });
    },
  });
}

export function useBatchDeleteCustomers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emails: string[]) => {
      const { data } = await axiosInstance.post("/orders/admin/customer/batch-delete", { emails });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
      qc.invalidateQueries({ queryKey: ["admin", "customersCount"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/auth/users/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "usersCount"] });
    },
  });
}

export function useBatchDeleteUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await axiosInstance.post("/auth/users/batch-delete", { ids });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "usersCount"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(`/drinks/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "categoryStats"] });
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id?: string; formData: FormData }) => {
      if (id) {
        const { data } = await axiosInstance.put(`/drinks/${id}`, formData);
        return data;
      }
      const { data } = await axiosInstance.post("/drinks/add", formData);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "categoryStats"] });
    },
  });
}
