"use client";

import { useEffect } from "react";

export function ScrollRestoration() {
  useEffect(() => {
    // Reset any body styles that might have been left over from modals
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.classList.remove("modal-open");
  }, []);

  return null;
}
