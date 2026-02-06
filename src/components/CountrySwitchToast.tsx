"use client";

import { memo, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUIStore } from "@/lib/cart/uiStore";
import { useLocale } from "@/lib/locale/LocaleContext";
import { COUNTRY_MAP } from "@/lib/locale/countries";
import { countryToLocale } from "@/lib/locale/localeUtils";

const CountrySwitchToast = memo(function CountrySwitchToast() {
  const showToast = useUIStore((s) => s.showCountrySwitchToast);
  const data = useUIStore((s) => s.countrySwitchData);
  const hideToast = useUIStore((s) => s.hideCountrySwitch);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    if (showToast) {
      setTimeout(() => setIsVisible(true), 10);
      const timer = setTimeout(() => {
        setIsVisible(false);
        hideToast();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showToast, hideToast]);

  if (!data) return null;

  const newConfig = COUNTRY_MAP[data.newCountry];

  const handleChangeBack = () => {
    // Only write localStorage if actually switching to a different country (avoid loops)
    if (data.prevCountry !== data.newCountry) {
      localStorage.setItem(
        "z2r-country-switch",
        JSON.stringify({ prevCountry: data.newCountry }),
      );
    }
    const prevLocale = countryToLocale(data.prevCountry);
    const newPath = pathname.replace(`/${locale}`, `/${prevLocale}`);
    hideToast();
    router.push(newPath);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Changed to ${newConfig?.name} and ${data.newCurrency} currency`}
      className={`fixed top-12 xl:top-16 right-0 z-50 transform transition-transform duration-500 ease-in-out w-full xl:w-[27vw] ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="bg-white w-full px-4 py-3 shadow-md">
        <p className="text-xs">
          Changed to {newConfig?.name} and {data.newCurrency} currency,{" "}
          <button
            onClick={handleChangeBack}
            className="underline cursor-pointer hover:text-gray-500"
          >
            click here to change back
          </button>
          .
        </p>
      </div>
    </div>
  );
});

export default CountrySwitchToast;
