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

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSearchOpen, setIsSearchOpen } = useSearchStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const { lockScroll, unlockScroll } = useModalScrollRestoration();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
      <div className="bg-black text-white text-center h-6 text-xs py-1">
        Free standard shipping on orders over $100
      </div>
      <nav className="text-xs flex justify-between items-center h-8 relative bg-white">
        <div className="flex items-center gap-4 ml-4">
          <button
            onClick={() => {
              lockScroll();
              setIsMenuOpen(true);
            }}
            className="hover:text-gray-300"
          >
            Menu
          </button>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-sm font-bold" onClick={() => router.push("/")}>
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
            Search
          </button>
          <span
            onClick={() => {
              lockScroll();
              setIsCartOpen(true);
            }}
          >
            Cart
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
