import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers, updateUserRole } from "@/lib/user-admin-service";
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
    <Card>
      <CardHeader>
        <CardTitle>User roles ({users.length})</CardTitle>
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
              <Select
                value=""
                onValueChange={(role) => addRole(u.id, role)}
                disabled={assigning?.userId === u.id}
              >
                <SelectTrigger className="w-full sm:w-[130px] sm:ml-3">
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
            </div>
          );
        })}
        {users.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No users found.</p>
        )}
      </CardContent>
    </Card>
  );
}
