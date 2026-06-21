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
 * Provides the current theme (light/dark) to the component tree.
 * Toggles the "dark" class on <html> for Tailwind CSS v4.
 * Falls back to the user's prefers-color-scheme on first visit.
 * Persists the choice to localStorage.
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

/** Returns the current theme context. Must be used within a ThemeProvider. */
export function useTheme() {
  return useContext(ThemeContext);
}
