"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import MenuModal from "./MenuModal";
import SearchModal from "./SearchModal";
import { useSearchStore } from "@/store/searchStore";
import { useRouter } from "next/navigation";
import CartModal from "./CartModal";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { useCartStore } from "@/lib/cart/store";
import { Search } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSearchOpen, setIsSearchOpen } = useSearchStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const { lockScroll, unlockScroll } = useModalScrollRestoration();
  const totalItems = useCartStore((state) => state.getTotalItems());
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
      <nav className="text-sm flex justify-between items-center h-12 relative bg-white">
        <div className="flex items-center gap-4 ml-4">
          <button
            aria-label="Open menu"
            onClick={() => {
              lockScroll();
              setIsMenuOpen(true);
            }}
            className="flex flex-col justify-between w-4 h-3 z-50 hover:text-gray-300"
          >
            <span className="w-full h-0.5 bg-current" />
            <span className="w-full h-0.5 bg-current" />
            <span className="w-full h-0.5 bg-current" />
          </button>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg font-bold" onClick={() => router.push("/")}>
            Zone 2
          </span>
        </div>
        <div className="flex items-center gap-4 mr-4">
          <button
            onClick={() => {
              lockScroll();
              setIsSearchOpen(true);
            }}
            className="hover:text-gray-300"
          >
            <Search className="w-5 h-4 text-current" />
          </button>
          <span
            onClick={() => {
              lockScroll();
              setIsCartOpen(true);
            }}
          >
            Cart ({totalItems})
          </span>
        </div>
      </nav>

      <MenuModal isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <SearchModal />
      <CartModal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </header>
  );
}

export default Header;
