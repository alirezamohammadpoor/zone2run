"use client";

import React, { useState } from "react";
import { getSiteSettings } from "@/sanity/lib/getData";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import MenuModal from "./MenuModal";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <div className="bg-black text-white text-center h-6 text-xs py-1">
        Free standard shipping on orders over $100
      </div>
      <nav className="text-xs flex justify-between items-center h-8 relative">
        <div className="flex items-center gap-4 ml-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="hover:text-gray-300"
          >
            Menu
          </button>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-sm font-bold">Zone 2</span>
        </div>
        <div className="flex items-center gap-4 mr-4">
          <span>Search</span>
          <span>Cart</span>
        </div>
      </nav>

      <MenuModal isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </header>
  );
}

export default Header;
