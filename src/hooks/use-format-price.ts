import { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * Returns a memoised price formatter function.
 * Uses the current language to determine locale (de-DE or en-IE).
 * The formatter is recreated only when the language changes.
 */
export function useFormatPrice() {
  const { lang } = useLanguage();
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-IE", {
        style: "currency",
        currency: "EUR",
      }),
    [lang],
  );
  return (value: number) => formatter.format(value);
}
