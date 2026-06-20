import { Link } from "@tanstack/react-router";
import { Pill, Phone, Mail, MapPin, ShieldCheck, Truck } from "lucide-react";

export function ImpressumFooter() {
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
          <p className="mt-3 text-xs text-slate-500">Mon–Fri 8:00–20:00, Sat 9:00–18:00</p>
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
