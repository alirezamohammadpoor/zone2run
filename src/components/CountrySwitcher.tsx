"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useLocale } from "@/lib/locale/LocaleContext";
import { COUNTRY_MAP, SUPPORTED_COUNTRIES } from "@/lib/locale/countries";
import { countryToLocale } from "@/lib/locale/localeUtils";
import { Backdrop } from "@/components/ui/Backdrop";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";

const FocusLock = dynamic(() => import("react-focus-lock"), { ssr: false });

const COUNTRY_OPTIONS = SUPPORTED_COUNTRIES.map(
  (code) => COUNTRY_MAP[code],
).sort((a, b) => a.name.localeCompare(b.name));

interface CountrySwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CountrySwitcher({ isOpen, onClose }: CountrySwitcherProps) {
  const { locale, country } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { unlockScroll } = useModalScrollRestoration();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const config = COUNTRY_MAP[country];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setDropdownOpen(false);
    onClose();
    setTimeout(() => {
      unlockScroll();
    }, 300);
  }, [onClose, unlockScroll]);

  const handleSelect = useCallback(
    (newCountry: string) => {
      setDropdownOpen(false);
      localStorage.setItem("z2r-country-switch", JSON.stringify({ prevCountry: country }));
      const newLocale = countryToLocale(newCountry);
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPath);
      handleClose();
    },
    [locale, pathname, router, handleClose, country],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        listboxRef.current &&
        !listboxRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Reset dropdown state when modal closes
  useEffect(() => {
    if (!isOpen) setDropdownOpen(false);
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <>
      <Backdrop isOpen={isOpen} onClick={handleClose} />
      <FocusLock disabled={!isOpen}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="country-modal-title"
          inert={!isOpen ? true : undefined}
          className={
            "fixed inset-0 bg-white z-50 transform transition-transform duration-300 flex flex-col xl:right-auto xl:w-1/2 overscroll-contain" +
            (isOpen ? " translate-x-0" : " -translate-x-full")
          }
        >
          <ModalHeader
            title="Language & Country"
            titleId="country-modal-title"
            onClose={handleClose}
          />
          <div className="px-4 pt-6">
            {/* Custom select dropdown */}
            <div className="relative">
              <span className="block text-[10px] text-gray-500 mb-1">
                Select country
              </span>
              <button
                ref={triggerRef}
                type="button"
                role="combobox"
                aria-expanded={dropdownOpen}
                aria-controls="country-listbox"
                aria-label="Select country"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between border border-gray-300 px-3 py-3 text-xs bg-white cursor-pointer hover:border-gray-400 transition-colors"
              >
                <span>{config?.name} ({config?.currency})</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 5 8"
                  width="5"
                  height="8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-200 ${dropdownOpen ? "-rotate-90" : "rotate-90"}`}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {/* Dropdown list */}
              {dropdownOpen && (
                <ul
                  ref={listboxRef}
                  id="country-listbox"
                  role="listbox"
                  aria-label="Countries"
                  className="absolute left-0 right-0 top-full border border-t-0 border-gray-300 bg-white max-h-96 overflow-y-auto z-10"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <li
                      key={c.code}
                      role="option"
                      aria-selected={c.code === country}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(c.code)}
                        className={`w-full text-left text-xs px-3 py-2.5 hover:bg-gray-100 cursor-pointer transition-colors ${
                          c.code === country ? "font-bold" : ""
                        }`}
                      >
                        {c.name} ({c.currency})
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </FocusLock>
    </>,
    document.body,
  );
}
