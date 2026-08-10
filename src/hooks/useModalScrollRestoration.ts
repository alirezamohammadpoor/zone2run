"use client";

import { useScrollStore } from "@/store/scroll";

export function useModalScrollRestoration() {
  const { setScrollY, setLockedPathname } = useScrollStore();

  const lockScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    // Event-time read instead of usePathname() — a render-time URL read would
    // block prerendering of every dynamic route under Cache Components
    setLockedPathname(window.location.pathname);

    // Calculate scrollbar width before locking
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll without jump using position: fixed
    document.body.style.position = "fixed";
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";
    // Add padding to compensate for scrollbar disappearing
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Also apply to fixed header
    const header = document.querySelector("header");
    if (header) {
      (header as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const unlockScroll = () => {
    // Read fresh values from the store at call time (not stale closure values)
    const { scrollY: savedScrollY, lockedPathname } = useScrollStore.getState();
    const currentPathname = window.location.pathname;
    const wasLockedOnThisPage =
      lockedPathname !== null &&
      // Compare ignoring locale prefix since usePathname returns locale-less paths
      (lockedPathname === currentPathname ||
        currentPathname.endsWith(lockedPathname) ||
        lockedPathname.endsWith(currentPathname));
    setLockedPathname(null);

    // Reset body styles
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.paddingRight = "";

    // Reset header padding
    const header = document.querySelector("header");
    if (header) {
      (header as HTMLElement).style.paddingRight = "";
    }

    // Only restore scroll if we're still on the same page
    // If the user navigated away (e.g., clicked a link in the modal),
    // the new page should start at its own scroll position (top)
    if (wasLockedOnThisPage) {
      window.scrollTo(0, savedScrollY);
    }
  };

  return { lockScroll, unlockScroll };
}
