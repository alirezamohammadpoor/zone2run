"use client";

import { useEffect } from "react";

export function useModalScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      // Remove class AND reset all inline styles when closing
      document.body.classList.remove("modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}
