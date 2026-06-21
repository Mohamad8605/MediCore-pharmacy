import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Truck,
  Clock,
  Pill,
  Stethoscope,
  HeartPulse,
  Baby,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { ERezeptScanner } from "@/components/ERezeptScanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mohamad's MediCore Pharmacy GmbH online — Trusted Online Pharmacy" },
      {
        name: "description",
        content:
          "Order prescription and over-the-counter medicines online. Upload your prescription, fast delivery, and personal pharmacist support.",
      },
    ],
  }),
  component: Index,
});

const categories = [
  { icon: Pill, label: "Pain & Fever" },
  { icon: HeartPulse, label: "Cold & Flu" },
  { icon: Baby, label: "Mother & Baby" },
  { icon: Stethoscope, label: "Skin & Wound Care" },
];

const trustPoints = [
  { icon: ShieldCheck, label: "Registered Pharmacy", sub: "Fully licensed & regulated" },
  { icon: Truck, label: "Fast Delivery", sub: "Free over €25 · 1–3 working days" },
  { icon: Clock, label: "Pharmacist Support", sub: "Mon–Sat, real human advice" },
];

function Index() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto grid items-center gap-12 px-4 py-16 md:grid-cols-5 md:py-24">
          <div className="md:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Your pharmacy · online & on-site
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Order medicines with confidence.
              <br />
              <span className="text-primary">Upload your prescription in seconds.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              A modern online pharmacy: over-the-counter products, secure prescription upload, and
              personal pharmacist support — all in one calm, clear interface.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/medications">
                <Button size="lg" className="rounded-xl gap-2">
                  Browse medicines <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#prescription">
                <Button size="lg" variant="outline" className="rounded-xl">
                  Upload prescription
                </Button>
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustPoints.map((t) => (
                <div
                  key={t.label}
                  className="flex items-start gap-3 rounded-2xl border bg-card p-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2" id="prescription">
            <ERezeptScanner />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.label}
              to="/medications"
              search={{ category: c.label }}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <c.icon className="h-5 w-5" />
              </span>
              <span className="font-medium">{c.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <ProductGrid />
      </section>

      <section className="border-y bg-slate-50">
        <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">Pharmacist-reviewed safety</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every prescription medicine is reviewed by a registered pharmacist before it leaves
              our dispensary.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Transparent pricing</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              All prices include VAT with no hidden fees. Free delivery on orders over €25.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">GDPR-grade privacy</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your health data stays encrypted. We never share it with third parties — all data is
              stored on EU servers.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
