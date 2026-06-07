import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuth } from "@/context/Authcontext";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    connect,
    disconnect,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (user?.token) {
      connect(user.token);
      fetchNotifications();
    }
    return () => {
      disconnect();
    };
  }, [user?.token]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-GB");
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border bg-card shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllAsRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[70vh]">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => {
                  const Wrapper = n.link ? Link : "div";
                  return (
                    <Wrapper
                      key={n._id}
                      {...(n.link ? { to: n.link, onClick: () => { markAsRead(n._id); setOpen(false); } } : {})}
                      className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 cursor-pointer ${
                        !n.read ? "bg-muted/30" : ""
                      }`}
                      onClick={() => !n.link ? markAsRead(n._id) : undefined}
                    >
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{n.title}</p>
                        <p className="text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
