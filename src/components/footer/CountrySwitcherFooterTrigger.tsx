"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "@/lib/locale/LocaleContext";
import { COUNTRY_MAP } from "@/lib/locale/countries";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";

const CountrySwitcher = dynamic(() => import("@/components/CountrySwitcher"));

export default function CountrySwitcherFooterTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { country } = useLocale();
  const config = COUNTRY_MAP[country];
  const { lockScroll } = useModalScrollRestoration();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          lockScroll();
          setIsOpen(true);
        }}
        className="text-xs hover:underline cursor-pointer"
        aria-label="Select country and currency"
      >
        EN / {config?.currency}
      </button>
      <CountrySwitcher isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
