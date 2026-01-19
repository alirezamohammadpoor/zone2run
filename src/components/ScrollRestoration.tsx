"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset any body styles that might have been left over from modals
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.classList.remove("modal-open");
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
