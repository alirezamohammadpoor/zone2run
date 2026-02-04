"use client";

import { createContext, useContext, useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

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
  useEffect(() => {
    setCountry(country);
  }, [country, setCountry]);

  return (
    <LocaleContext.Provider value={{ locale, country }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
