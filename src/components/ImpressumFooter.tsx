import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Pill, Phone, Mail, MapPin, ShieldCheck, Truck } from "lucide-react";
import { getPublicSettings } from "@/lib/admin-service";

type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

type HoursRecord = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

const defaultHours: HoursRecord = {
  monday: { open: "08:00", close: "20:00", closed: false },
  tuesday: { open: "08:00", close: "20:00", closed: false },
  wednesday: { open: "08:00", close: "20:00", closed: false },
  thursday: { open: "08:00", close: "20:00", closed: false },
  friday: { open: "08:00", close: "20:00", closed: false },
  saturday: { open: "09:00", close: "18:00", closed: false },
  sunday: { open: "10:00", close: "16:00", closed: true },
};

function formatHours(h: HoursRecord): string {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
  const abbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const parts: string[] = [];
  let i = 0;
  while (i < 7) {
    const day = days[i];
    if (h[day].closed) {
      i++;
      continue;
    }
    const open = h[day].open;
    const close = h[day].close;
    let j = i + 1;
    while (j < 7 && !h[days[j]].closed && h[days[j]].open === open && h[days[j]].close === close) {
      j++;
    }
    if (j - i === 1) {
      parts.push(`${abbr[i]} ${open}–${close}`);
    } else {
      parts.push(`${abbr[i]}–${abbr[j - 1]} ${open}–${close}`);
    }
    i = j;
  }
  return parts.join(", ") || "Closed";
}

export function ImpressumFooter() {
  const [hoursText, setHoursText] = useState("Mon–Fri 8:00–20:00, Sat 9:00–18:00");

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        if (settings.pharmacy_hours) {
          try {
            const h = typeof settings.pharmacy_hours === "string"
              ? JSON.parse(settings.pharmacy_hours as string)
              : settings.pharmacy_hours;
            const merged: HoursRecord = { ...defaultHours };
            for (const day of Object.keys(defaultHours) as (keyof HoursRecord)[]) {
              if (h[day]) merged[day] = { ...merged[day], ...h[day] };
            }
            setHoursText(formatHours(merged));
          } catch { /* keep default */ }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-20 border-t bg-slate-50">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Pill className="h-5 w-5" />
            Mohamad's MediCore Pharmacy GmbH online
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Your trusted online pharmacy. Certified, secure and fast — with personal pharmacist
            support whenever you need it.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Licensed pharmacy
            </span>
            <span className="inline-flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              Germany-wide delivery
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Service</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/medications" className="hover:text-primary">
                Medicines
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-primary">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Customer service
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                Track order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/about" className="hover:text-primary">
                About us
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-primary">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-primary">
                Terms & conditions
              </Link>
            </li>
            <li>
              <Link to="/withdrawal" className="hover:text-primary">
                Right of withdrawal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              Apothekenstraße 12, 10115 Berlin
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              +49 30 98765432
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              support@mohamads-medicore-pharmacy.de
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">{hoursText}</p>
        </div>
      </div>

      <div className="border-t bg-white">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} Mohamad's MediCore Pharmacy GmbH online · VAT DE123456789 ·
            Superintendent Pharmacist: Dr. Anna Schmidt
          </p>
          <p>Registered with the Berlin Chamber of Pharmacists</p>
        </div>
      </div>
    </footer>
  );
}
