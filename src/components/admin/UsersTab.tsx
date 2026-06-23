import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ShieldAlert, User, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers, updateUserRole, createUser, deleteUser } from "@/lib/user-admin-service";
import { useAuth } from "@/lib/auth";

const ROLES = ["admin", "pharmacist", "patient"] as const;

type UserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  roles: string[];
};

export function UsersTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<{ userId: string; role: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRoleValue, setAddRoleValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data as UserRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addRole(userId: string, role: string) {
    setAssigning({ userId, role });
    try {
      await updateUserRole(userId, role as "admin" | "pharmacist" | "patient", "add");
      toast.success(`Role "${role}" added`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add role");
    }
    setAssigning(null);
  }

  async function removeRole(userId: string, role: string) {
    setAssigning({ userId, role });
    try {
      await updateUserRole(userId, role as "admin" | "pharmacist" | "patient", "remove");
      toast.success(`Role "${role}" removed`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove role");
    }
    setAssigning(null);
  }

  async function handleAddUser() {
    if (!addEmail || !addPassword) return;
    setSaving(true);
    try {
      await createUser(addEmail, addPassword, addRoleValue);
      toast.success("User created");
      setAddOpen(false);
            setAddEmail("");
            setAddPassword("");
            setAddRoleValue("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    }
    setSaving(false);
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success("User deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800 border-red-200",
    pharmacist: "bg-blue-100 text-blue-800 border-blue-200",
    patient: "bg-green-100 text-green-800 border-green-200",
  };

  const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    admin: ShieldAlert,
    pharmacist: Shield,
    patient: User,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>User roles ({users.length})</CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add user</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={addRoleValue} onValueChange={setAddRoleValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddUser} disabled={saving || !addEmail || !addPassword}>
                {saving ? "Creating…" : "Create user"}
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((u) => {
            const availableRoles = ROLES.filter((r) => !u.roles.includes(r));
            const isSelf = u.id === currentUser?.id;
            return (
              <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {u.first_name || u.last_name
                      ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                      : "Unnamed user"}
                    {isSelf && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {u.roles.map((role: string) => {
                      const Icon = roleIcons[role] || User;
                      return (
                        <Badge
                          key={role}
                          variant="outline"
                          className={`gap-1 px-2 py-0.5 text-xs ${roleColors[role] ?? ""}`}
                        >
                          <Icon className="h-3 w-3" />
                          {role}
                          <button
                            onClick={() => removeRole(u.id, role)}
                            disabled={
                              (assigning?.userId === u.id && assigning?.role === role) ||
                              (role === "patient" &&
                                u.roles.filter((r: string) => r === "patient").length <= 1) ||
                              (role === "admin" && isSelf)
                            }
                            className="ml-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
                            title={
                              role === "patient" &&
                              u.roles.filter((r: string) => r === "patient").length <= 1
                                ? "Cannot remove last patient role"
                                : role === "admin" && isSelf
                                  ? "Cannot remove your own admin role"
                                  : "Remove role"
                            }
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value=""
                    onValueChange={(role) => addRole(u.id, role)}
                    disabled={assigning?.userId === u.id}
                  >
                    <SelectTrigger className="w-full sm:w-[130px]">
                      <SelectValue placeholder="Add role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          All roles assigned
                        </SelectItem>
                      ) : (
                        availableRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!isSelf && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(u)}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deleteTarget?.first_name ?? deleteTarget?.last_name
                  ? `${deleteTarget?.first_name ?? ""} ${deleteTarget?.last_name ?? ""}`.trim()
                  : "this user"}
              </strong>{" "}
              and all their data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
