import { useState, useEffect } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Users as UsersIcon, UserPlus, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/api/axios";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      axiosInstance.get("/auth/users/count"),
      axiosInstance.get("/auth/users"),
    ]).then(([countRes, usersRes]) => {
      if (countRes.status === "fulfilled") {
        setTotalUsers(countRes.value.data.total ?? 0);
        setNewThisMonth(countRes.value.data.thisMonth ?? 0);
      }
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data.users ?? []);
      setLoading(false);
    });
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => prev.size === users.length ? new Set() : new Set(users.map((u) => u._id)));
  }

  async function handleBatchDelete() {
    if (selected.size === 0) return;
    setBatchDeleting(true);
    try {
      const { data } = await axiosInstance.post("/auth/users/batch-delete", { ids: Array.from(selected) });
      setUsers((prev) => prev.filter((u) => !selected.has(u._id)));
      setTotalUsers((prev) => prev - (data.deleted ?? selected.size));
      toast.success(`${data.deleted ?? selected.size} user(s) deleted`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete users");
    } finally {
      setBatchDeleting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/auth/users/${deleteTarget._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setTotalUsers((prev) => prev - 1);
      toast.success("User deleted permanently");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleteTarget(null);
    }
  }

  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts, roles, and permissions</p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
              <Card><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
            </div>
            <div className="rounded-lg border bg-card shadow-sm p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                      <h3 className="text-3xl font-heading font-bold tracking-tight">{totalUsers}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-muted text-primary"><UsersIcon className="h-5 w-5" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">New This Month</p>
                      <h3 className="text-3xl font-heading font-bold tracking-tight">{newThisMonth}</h3>
                      <p className="text-sm text-muted-foreground">{monthName}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted text-emerald-500"><UserPlus className="h-5 w-5" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {selected.size > 0 && (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                <span className="text-sm font-medium">{selected.size} user(s) selected</span>
                <Button variant="destructive" size="sm" onClick={handleBatchDelete} disabled={batchDeleting}>
                  <Trash className="h-4 w-4 mr-2" />
                  {batchDeleting ? "Deleting..." : "Delete Selected"}
                </Button>
              </div>
            )}

            <div className="w-full overflow-x-auto rounded-lg border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="w-10 px-4 py-3">
                      <Checkbox checked={selected.size === users.length && users.length > 0} onCheckedChange={toggleAll} />
                    </th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Role</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Email</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Account Type</th>
                    <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Last Active</th>
                    <th className="text-right font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted-foreground py-12">No users found</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <Checkbox checked={selected.has(u._id)} onCheckedChange={() => toggleSelect(u._id)} />
                        </td>
                        <td className="px-4 py-3 font-medium">{u.username}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.isAdmin ? "default" : "secondary"}>{u.isAdmin ? "Admin" : "User"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3"><Badge variant="outline">Standard</Badge></td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-GB") : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(u)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for <strong>{deleteTarget?.username}</strong> ({deleteTarget?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
