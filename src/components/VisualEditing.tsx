"use client";

import { enableVisualEditing } from "@sanity/visual-editing";
import { useEffect } from "react";

export default function VisualEditing() {
  useEffect(() => {
    const cleanup = enableVisualEditing({
      zIndex: 1000000,
    });
    return cleanup;
  }, []);

  return null;
}
