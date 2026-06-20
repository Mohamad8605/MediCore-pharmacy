import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShoppingCart, ShieldAlert, BadgeCheck, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useMedications } from "@/hooks/use-medications";

export function ProductGrid() {
  const { meds, loading, categories, filter } = useMedications();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const add = useCart((s) => s.add);
  const fp = useFormatPrice();

  const filtered = useMemo(() => filter(query, category), [query, category, filter]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Featured medicines</h2>
          <p className="text-sm text-muted-foreground">
            All prices include VAT · Germany-wide delivery
          </p>
        </div>
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search medicines…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <article
            key={p.id}
            className="group flex flex-col rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Link to="/medications/$id" params={{ id: p.id }} className="group">
              <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                {p.image_url && !failedImages.has(p.id) ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    onError={() => setFailedImages((prev) => new Set(prev).add(p.id))}
                  />
                ) : (
                  <Pill className="h-14 w-14 text-primary/40" />
                )}
              </div>
              <div className="mb-2 flex items-start justify-between gap-2">
                {p.requires_prescription ? (
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
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {p.category}
                </span>
              </div>

              <h3 className="font-semibold leading-snug group-hover:text-primary">{p.name}</h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-lg font-semibold tracking-tight">{fp(Number(p.price))}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 rounded-xl"
                disabled={p.stock === 0}
                onClick={() => {
                  add(p, 1);
                  toast.success(`${p.name} added to cart`);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="rounded-2xl border bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
          No medicines match your search. Try a different keyword or category.
        </p>
      )}
      {loading && (
        <p className="rounded-2xl border bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
          Loading medicines…
        </p>
      )}
    </section>
  );
}
