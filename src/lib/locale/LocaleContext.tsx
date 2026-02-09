"use client";

import { createContext, useContext, useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";
import { useUIStore } from "@/lib/cart/uiStore";
import { COUNTRY_MAP } from "@/lib/locale/countries";

interface LocaleContextValue {
  locale: string; // "en-se"
  country: string; // "SE"
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en-se",
  country: "SE",
});

export function LocaleProvider({
  locale,
  country,
  children,
}: LocaleContextValue & { children: React.ReactNode }) {
  // Sync cart store country when locale changes (e.g. /en-se → /en-dk).
  // setCountry() clears shopifyCartId/checkoutUrl/lineIds synchronously —
  // next addItem() creates a fresh cart with the new country's currency.
  const setCountry = useCartStore((s) => s.setCountry);
  const showCountrySwitch = useUIStore((s) => s.showCountrySwitch);
  useEffect(() => {
    setCountry(country);

    // Detect country switch via localStorage (survives full page navigation)
    try {
      const raw = localStorage.getItem("z2r-country-switch");
      if (raw) {
        const { prevCountry } = JSON.parse(raw);
        if (prevCountry && prevCountry !== country) {
          const config = COUNTRY_MAP[country];
          showCountrySwitch({
            newCountry: country,
            newCurrency: config?.currency || "SEK",
            prevCountry,
          });
        }
        localStorage.removeItem("z2r-country-switch");
      }
    } catch {
      localStorage.removeItem("z2r-country-switch");
    }
  }, [country, setCountry, showCountrySwitch]);

  return (
    <LocaleContext.Provider value={{ locale, country }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
