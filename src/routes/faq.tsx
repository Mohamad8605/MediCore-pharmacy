import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Mohamad's MediCore Pharmacy GmbH online" },
      {
        name: "description",
        content: "Answers to common questions about ordering, prescriptions, delivery and payment.",
      },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "How do I order prescription medication?",
    a: "Add the prescription item to your cart, then upload a clear photo of your prescription during checkout. A pharmacist reviews it before the order is dispatched.",
  },
  {
    q: "How long does an order take?",
    a: "Pickup orders are usually ready the same day. Home delivery typically arrives within 1–3 working days depending on your PLZ.",
  },
  {
    q: "Is my personal data safe?",
    a: "Yes. Prescriptions are stored in a private file bucket and only accessible to verified pharmacy staff. Your account data is protected by row-level security.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Open “My Orders” from the navigation bar to see real-time status updates from received to ready.",
  },
  {
    q: "Which payment methods do you support?",
    a: "The current prototype simulates payment at checkout. A production deployment would integrate Stripe or another regulated payment processor.",
  },
  {
    q: "Can I cancel an order?",
    a: "Orders can be cancelled by contacting the pharmacy team while the status is still pending or confirmed.",
  },
];

function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-center text-4xl font-bold tracking-tight">Frequently asked questions</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
        Can't find what you're looking for?{" "}
        <Link to="/contact" className="text-primary underline">
          Contact us
        </Link>
        .
      </p>
      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`i-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-12 text-center">
        <Link to="/medications">
          <Button>Browse medications</Button>
        </Link>
      </div>
    </div>
  );
}
