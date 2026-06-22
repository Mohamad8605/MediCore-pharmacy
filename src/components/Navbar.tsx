import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Pill, User as UserIcon, LogOut, LayoutDashboard, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/lib/LanguageContext";
import { SearchOverlay } from "@/components/SearchOverlay";

export function Navbar() {
  const { user, isStaff, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navLinks = (
    <>
      <Link to="/" onClick={() => setMobileOpen(false)}>
        {t("nav.home")}
      </Link>
      <Link to="/medications" onClick={() => setMobileOpen(false)}>
        {t("nav.medications")}
      </Link>
      <Link to="/about" onClick={() => setMobileOpen(false)}>
        {t("nav.about")}
      </Link>
      <Link to="/faq" onClick={() => setMobileOpen(false)}>
        {t("nav.faq")}
      </Link>
      <Link to="/contact" onClick={() => setMobileOpen(false)}>
        {t("nav.contact")}
      </Link>
      {user && (
        <Link to="/orders" onClick={() => setMobileOpen(false)}>
          {t("nav.orders")}
        </Link>
      )}
      {isStaff && (
        <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-1">
          <LayoutDashboard className="h-4 w-4" />
          {t("nav.dashboard")}
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <Pill className="h-6 w-6" />
          <span className="xs:hidden text-lg truncate">MediCore</span>
          <span className="hidden xs:inline text-lg truncate">Mohamad's MediCore Pharmacy</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "de" ? "en" : "de")}
            aria-label={lang === "de" ? "Switch to English" : "Switch to German"}
            className="rounded-xl text-xs font-bold w-9 h-9"
          >
            {lang === "de" ? "EN" : "DE"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.search")}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <CartDrawer />
          {user ? (
            <>
              <Link to="/profile" aria-label="Profile">
                <Button variant="ghost" size="icon">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button className="rounded-xl">{t("nav.signIn")}</Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`overflow-hidden transition-all duration-200 md:hidden ${
          mobileOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-3 border-t bg-background px-4 py-4">{navLinks}</nav>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
