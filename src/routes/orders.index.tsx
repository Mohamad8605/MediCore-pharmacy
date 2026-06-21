import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatPrice } from "@/hooks/use-format-price";
import { fetchUserOrders, cancelOrder, deleteOrder } from "@/lib/order-service";
import { Route as ParentRoute } from "@/routes/orders";

type OrderSummary = {
  id: string;
  total_price: number;
  status: string;
  delivery_method: string;
  created_at: string;
  order_items: { quantity: number }[];
};

function OrdersPage() {
  const fp = useFormatPrice();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders()
      .then((data) => {
        setOrders(Array.isArray(data) ? (data as OrderSummary[]) : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load orders");
        setLoading(false);
      });
  }, []);

  async function handleCancel(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm("Delete this cancelled order permanently?")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Order deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete order");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My orders</h1>
      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-9 w-16 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/medications" className="mt-4 inline-block">
              <Button>Browse medications</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {o.order_items.length} items · {o.delivery_method}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={o.status === "cancelled" ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    {o.status === "cancelled" && <XCircle className="mr-1 h-3 w-3" />}
                    {o.status.replace("_", " ")}
                  </Badge>
                  <p className="font-semibold text-primary">{fp(Number(o.total_price))}</p>
                  <Link to="/orders/$id" params={{ id: o.id }}>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  {o.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancel(o.id)}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  {o.status === "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(o.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/orders/")({
  component: OrdersPage,
});
