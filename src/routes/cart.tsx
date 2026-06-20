import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { useFormatPrice } from "@/hooks/use-format-price";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Mohamad's MediCore Pharmacy GmbH online" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, remove, total, count, needsPrescription } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fp = useFormatPrice();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-20 w-20 text-muted-foreground/40" />
        <h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2>
        <Link to="/medications" className="mt-6 inline-block">
          <Button>Browse medications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Shopping cart ({count()})</h1>
      {needsPrescription() && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cart contains prescription medications. Upload required at checkout.
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((it) => (
            <Card key={it.medication.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex-1 min-w-0 sm:min-w-[200px]">
                  <h3 className="font-semibold">{it.medication.name}</h3>
                  <p className="text-sm text-muted-foreground">{fp(it.medication.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(it.medication.id, it.quantity - 1)}
                    disabled={it.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={it.quantity}
                    onChange={(e) => setQuantity(it.medication.id, parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(it.medication.id, it.quantity + 1)}
                    disabled={it.quantity >= it.medication.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {fp(it.medication.price * it.quantity)}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 text-destructive"
                    onClick={() => remove(it.medication.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{fp(total())}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery</span>
              <span>At checkout</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">{fp(total())}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate({ to: user ? "/checkout" : "/login" })}
            >
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/medications">
              <Button variant="outline" className="w-full">
                Continue shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
