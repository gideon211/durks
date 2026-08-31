"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShimmerBar } from "@/components/ui/shimmer-bar";
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
import { useUsers, useUsersCount, useBatchDeleteUsers, useDeleteUser } from "@/admin/queries";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function Users() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);

  const { data: usersData, isLoading } = useUsers();
  const { data: countData } = useUsersCount();
  const batchDeleteMutation = useBatchDeleteUsers();
  const deleteMutation = useDeleteUser();

  const users = (usersData?.users ?? []) as AdminUser[];
  const totalUsers = countData?.count ?? 0;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const newThisMonth = users.filter((u) => new Date(u.createdAt).getTime() >= monthStart).length;
  const loading = isLoading;

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

  function handleBatchDelete() {
    if (selected.size === 0) return;
    setBatchDeleting(true);
    batchDeleteMutation.mutate(Array.from(selected), {
      onSuccess: (res) => {
        const deleted = (res as { deleted?: number })?.deleted ?? selected.size;
        toast.success(`${deleted} user(s) deleted`);
        setSelected(new Set());
      },
      onError: () => toast.error("Failed to delete users"),
      onSettled: () => setBatchDeleting(false),
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => toast.success("User deleted permanently"),
      onError: () => toast.error("Failed to delete user"),
      onSettled: () => setDeleteTarget(null),
    });
  }

  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts, roles, and permissions</p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/10 rounded-xl p-5 md:p-6"><ShimmerBar className="h-4 w-24 mb-2" /><ShimmerBar className="h-8 w-16" /></div>
              <div className="bg-muted/10 rounded-xl p-5 md:p-6"><ShimmerBar className="h-4 w-24 mb-2" /><ShimmerBar className="h-8 w-16" /></div>
            </div>
            <div className="bg-muted/10 rounded-xl p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <ShimmerBar className="h-4 w-4 rounded shrink-0" />
                  <ShimmerBar className="h-4 w-full sm:w-32" />
                  <ShimmerBar className="h-6 w-full sm:w-16 rounded-full" />
                  <ShimmerBar className="h-4 w-full sm:w-40" />
                  <ShimmerBar className="h-6 w-full sm:w-20 rounded-full" />
                  <ShimmerBar className="h-4 w-full sm:w-24" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 md:space-y-2">
                      <p className="text-xs md:text-sm text-muted-foreground font-medium">Total Users</p>
                      <h3 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">{totalUsers}</h3>
                    </div>
                    <div className="p-2.5 md:p-3 rounded-xl bg-muted text-primary shrink-0"><UsersIcon className="h-4 w-4 md:h-5 md:w-5" /></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 md:space-y-2">
                      <p className="text-xs md:text-sm text-muted-foreground font-medium">New This Month</p>
                      <h3 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">{newThisMonth}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{monthName}</p>
                    </div>
                    <div className="p-2.5 md:p-3 rounded-xl bg-muted text-emerald-500 shrink-0"><UserPlus className="h-4 w-4 md:h-5 md:w-5" /></div>
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

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden min-w-0">
              <div className="w-full overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
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
    </>
  );
}
