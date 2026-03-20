import { useEffect, useRef } from "react";

/**
 * Closes a modal when the Escape key is pressed.
 * Uses a ref to track the latest callback, avoiding stale closures
 * without requiring callers to memoize their onClose function.
 */
export function useEscapeKey(isOpen: boolean, onClose: () => void) {
  const callbackRef = useRef(onClose);
  callbackRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") callbackRef.current();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);
}
