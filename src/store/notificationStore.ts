import { create } from "zustand";
import axiosInstance from "@/api/axios";

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  metadata: Record<string, unknown>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get("/notifications");
      if (data.success) {
        set({
          notifications: data.notifications,
          unreadCount: data.unreadCount,
        });
      }
    } catch (err) {
      console.error("fetchNotifications error:", err);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  },
}));
