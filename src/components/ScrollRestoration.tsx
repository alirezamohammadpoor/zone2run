"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollRestoration() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const isPopStateRef = useRef(false);

  useEffect(() => {
    // Reset any body styles that might have been left over from modals
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.left = "";
    document.body.style.right = "";

    // Track browser back/forward navigation so we can skip scroll-to-top
    // (the browser's native history API will restore the correct position)
    const handlePopState = () => {
      isPopStateRef.current = true;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to top on forward navigation only — let the browser restore
  // scroll position on back/forward navigation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
