"use client";

import { useEffect, useState } from "react";
import PreviewBanner from "./PreviewBanner";
import VisualEditing from "./VisualEditing";

/**
 * Client component that checks for draft mode cookie and renders preview UI.
 * This allows the layout to remain static/cacheable while still supporting preview mode.
 */
export default function PreviewProvider() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check for the Next.js draft mode cookie
    const cookies = document.cookie.split(";");
    const hasDraftCookie = cookies.some(
      (cookie) =>
        cookie.trim().startsWith("__prerender_bypass") ||
        cookie.trim().startsWith("__next_preview_data")
    );
    setIsPreview(hasDraftCookie);
  }, []);

  if (!isPreview) return null;

  return (
    <>
      <PreviewBanner />
      <VisualEditing />
    </>
  );
}
