import { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";

// Memoised per language so it doesnt recreate on every render
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
