import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const fallbackThemeContext: ThemeContextValue = {
  theme: "light",
  setTheme: () => undefined,
  toggle: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(fallbackThemeContext);

/**
 * Light/dark theme context. Persists to localStorage and reads the
 * system preference via prefers-color-scheme on first visit.
 * Styling toggles a "dark" class on <html>, which Tailwind picks up.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("apotheke-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      apply(stored);
      setThemeState(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = prefersDark ? "dark" : "light";
    apply(initial);
    setThemeState(initial);
  }, []);

  const apply = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  };

  const setTheme = (t: Theme) => {
    apply(t);
    setThemeState(t);
    if (typeof window !== "undefined") window.localStorage.setItem("apotheke-theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

/**
 * Access the theme context — current theme, setter, and toggle.
 */
export function useTheme() {
  return useContext(ThemeContext);
}
