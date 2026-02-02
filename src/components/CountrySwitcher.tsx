"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale/LocaleContext";
import { COUNTRY_MAP, SUPPORTED_COUNTRIES } from "@/lib/locale/countries";
import { countryToLocale } from "@/lib/locale/localeUtils";

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map(
  (code) => COUNTRY_MAP[code],
).sort((a, b) => a.name.localeCompare(b.name));

export default function CountrySwitcher() {
  const { locale, country } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newCountry: string) => {
    const newLocale = countryToLocale(newCountry);
    // Replace the locale segment in the current URL path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const config = COUNTRY_MAP[country];

  return (
    <select
      value={country}
      onChange={(e) => handleChange(e.target.value)}
      className="text-[10px] bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0 pr-4"
      aria-label="Select country"
    >
      {COUNTRY_OPTIONS.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name} ({c.currency})
        </option>
      ))}
    </select>
  );
}
