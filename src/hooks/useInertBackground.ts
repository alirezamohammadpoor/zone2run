import { useEffect } from "react";

/**
 * Sets inert on #main-content and the site <header> when a modal is open,
 * preventing keyboard/pointer interaction with background content.
 */
export function useInertBackground(isOpen: boolean) {
  useEffect(() => {
    const main = document.getElementById("main-content");
    const header = document.querySelector("header");

    if (isOpen) {
      main?.setAttribute("inert", "");
      header?.setAttribute("inert", "");
    } else {
      main?.removeAttribute("inert");
      header?.removeAttribute("inert");
    }

    return () => {
      main?.removeAttribute("inert");
      header?.removeAttribute("inert");
    };
  }, [isOpen]);
}
