"use client";

import { useState } from "react";
import LocaleLink from "@/components/LocaleLink";

import dynamic from "next/dynamic";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useCartStore } from "@/lib/cart/store";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useLocale } from "@/lib/locale/LocaleContext";
import { COUNTRY_MAP } from "@/lib/locale/countries";
import DesktopDropdown from "./header/DesktopDropdown";

// Lazy load modals - only downloaded when user opens them
const MenuModal = dynamic(() => import("./menumodal/MenuModal"));
const CartModal = dynamic(() => import("./CartModal"));
const AddedToCartModal = dynamic(() => import("./product/AddedToCartModal"));
const SearchModal = dynamic(() => import("./SearchModal"));
const CountrySwitcher = dynamic(() => import("./CountrySwitcher"));
const CountrySwitchToast = dynamic(() => import("./CountrySwitchToast"));
import type {
  BrandMenuItem,
  MenuData,
  MenuConfig,
  BlogPostMenuItem,
} from "@/types/menu";

type DropdownType = "men" | "women" | "help" | "ourSpace" | null;

function Header({
  menuData,
  brands,
  menuConfig,
  blogPosts,
}: {
  menuData?: MenuData;
  brands?: BrandMenuItem[];
  menuConfig?: MenuConfig;
  blogPosts?: BlogPostMenuItem[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const { lockScroll } = useModalScrollRestoration();
  // Inline selector - computes once per items change, avoids function call overhead
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const hasMounted = useHasMounted();
  const { country } = useLocale();
  const countryConfig = COUNTRY_MAP[country];

  const handleNavClick = (type: DropdownType) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
        <nav className="text-sm flex justify-between items-center h-12 xl:h-16 relative bg-white xl:px-4 text-xs">
          <div className="flex items-center gap-2">
            {/* Mobile: Hamburger menu */}
            <button
              aria-label="Open menu"
              onClick={() => {
                lockScroll();
                setIsMenuOpen(true);
              }}
              className="xl:hidden flex flex-col justify-between w-4 h-3 z-50 hover:text-gray-300 cursor-pointer"
            >
              <span className="w-full h-0.5 bg-current" />
              <span className="w-full h-0.5 bg-current" />
              <span className="w-full h-0.5 bg-current" />
            </button>

            {/* Desktop: Nav links */}
            <div className="hidden xl:flex items-center gap-4 justify-between">
              <button
                onClick={() => handleNavClick("men")}
                aria-expanded={activeDropdown === "men"}
                aria-haspopup="true"
                className={`hover:text-gray-500 cursor-pointer ${
                  activeDropdown === "men" ? "underline" : ""
                }`}
              >
                Men
              </button>
              <button
                onClick={() => handleNavClick("women")}
                aria-expanded={activeDropdown === "women"}
                aria-haspopup="true"
                className={`hover:text-gray-500 cursor-pointer ${
                  activeDropdown === "women" ? "underline" : ""
                }`}
              >
                Women
              </button>
              <button
                onClick={() => handleNavClick("help")}
                aria-expanded={activeDropdown === "help"}
                aria-haspopup="true"
                className={`hover:text-gray-500 cursor-pointer ${
                  activeDropdown === "help" ? "underline" : ""
                }`}
              >
                Help
              </button>
              <button
                onClick={() => handleNavClick("ourSpace")}
                aria-expanded={activeDropdown === "ourSpace"}
                aria-haspopup="true"
                className={`hover:text-gray-500 cursor-pointer ${
                  activeDropdown === "ourSpace" ? "underline" : ""
                }`}
              >
                Our Space
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <LocaleLink
              href="/"
              prefetch={true}
              className="text-sm cursor-pointer"
            >
              Zone 2
            </LocaleLink>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                lockScroll();
                setIsCountryOpen(true);
              }}
              className="hidden xl:block hover:text-gray-500 text-xs"
              aria-label="Select country and currency"
            >
              EN / {countryConfig?.currency}
            </button>
            <button
              onClick={() => {
                lockScroll();
                setIsSearchOpen(true);
              }}
              className="hover:text-gray-500 text-xs"
              aria-label="Search products"
            >
              Search
            </button>
            <button
              className="text-xs"
              aria-label={`Open cart, ${hasMounted ? totalItems : 0} items`}
              onClick={() => {
                lockScroll();
                setIsCartOpen(true);
              }}
            >
              {hasMounted ? `Cart (${totalItems})` : "Cart (0)"}
            </button>
          </div>
        </nav>

        {/* Desktop Dropdown */}
        <DesktopDropdown
          activeDropdown={activeDropdown}
          onClose={handleCloseDropdown}
          menuData={menuData}
          brands={brands}
          menuConfig={menuConfig}
          blogPosts={blogPosts}
        />
      </header>

      <MenuModal
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuData={menuData}
        brands={brands}
        menuConfig={menuConfig}
      />
      <CartModal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <AddedToCartModal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CountrySwitcher
        isOpen={isCountryOpen}
        onClose={() => setIsCountryOpen(false)}
      />
      <CountrySwitchToast />
    </>
  );
}

export default Header;
