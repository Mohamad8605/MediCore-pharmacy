import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Pill, ShoppingCart, ShieldAlert, BadgeCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useMedications } from "@/hooks/use-medications";
import { useStockSync } from "@/lib/use-stock-sync";
import { addToCartWithCheck } from "@/lib/add-to-cart-with-check";
import { Route as ParentRoute } from "@/routes/medications";

function MedicationsPage() {
  const { category: urlCategory } = ParentRoute.useSearch();
  const navigate = useNavigate();
  const { meds, loading, categories, filter } = useMedications();
  const ids = useMemo(() => meds.map((m) => m.id), [meds]);
  const stockMap = useStockSync(ids);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(urlCategory ?? "all");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const fp = useFormatPrice();

  const filtered = useMemo(
    () => filter(q, category === "all" ? "All" : category),
    [q, category, filter],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Medications</h1>
      <p className="mt-1 text-muted-foreground">Browse our catalog of {meds.length} products.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            navigate({ to: ".", search: v === "all" ? {} : { category: v }, replace: true });
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories
              .filter((c) => c !== "All")
              .map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => {
            return (
              <Card key={m.id} className="overflow-hidden transition hover:shadow-lg">
                <Link to="/medications/$id" params={{ id: m.id }}>
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                    {m.image_url && !failedImages.has(m.id) ? (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={() => setFailedImages((prev) => new Set(prev).add(m.id))}
                      />
                    ) : (
                      <Pill className="h-16 w-16 text-primary/40" />
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    {m.requires_prescription ? (
                      <Badge variant="destructive" className="gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Prescription
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                        <BadgeCheck className="h-3 w-3" />
                        Over the counter
                      </Badge>
                    )}
                  </div>
                  <Link
                    to="/medications/$id"
                    params={{ id: m.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {m.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{m.category}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">{fp(Number(m.price))}</span>
                      <p className="text-[11px] text-muted-foreground">
                        {(stockMap[m.id] ?? m.stock) > 0
                          ? `${stockMap[m.id] ?? m.stock} in stock`
                          : "Out of stock"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={(stockMap[m.id] ?? m.stock) === 0}
                      onClick={() => addToCartWithCheck(m, 1)}
                    >
                      <ShoppingCart className="mr-1 h-4 w-4" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              No medications match your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/medications/")({
  component: MedicationsPage,
});
