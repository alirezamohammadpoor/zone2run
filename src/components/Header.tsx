"use client";

import { useState } from "react";
import Link from "next/link";
import MenuModal from "./menumodal/MenuModal";
import CartModal from "./CartModal";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useCartStore } from "@/lib/cart/store";
import { useHasMounted } from "@/hooks/useHasMounted";
import AddedToCartModal from "./product/AddedToCartModal";
import DesktopDropdown from "./header/DesktopDropdown";
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
  // const { isSearchOpen, setIsSearchOpen } = useSearchStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const { lockScroll } = useModalScrollRestoration();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const hasMounted = useHasMounted();

  const handleNavClick = (type: DropdownType) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
      <nav className="text-sm flex justify-between items-center h-12 xl:h-16 relative bg-white xl:px-16 text-xs">
        <div className="flex items-center gap-2 ml-4">
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
          <div className="hidden xl:flex items-center gap-2">
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
          <Link href="/" className="text-sm cursor-pointer">
            Zone 2
          </Link>
        </div>

        <div className="flex items-center gap-2 px-2">
          {/* <button
            onClick={() => {
              lockScroll();
              setIsSearchOpen(true);
            }}
            className="hover:text-gray-300"
          >
            Search
          </button> */}
          <button
            className="text-xs"
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

      <MenuModal
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuData={menuData}
        brands={brands}
        menuConfig={menuConfig}
      />
      <CartModal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <AddedToCartModal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </header>
  );
}

export default Header;
