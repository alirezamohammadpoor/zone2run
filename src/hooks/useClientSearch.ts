"use client";

import { useSyncExternalStore } from "react";

/**
 * Non-suspending replacement for useSearchParams on prerendered routes.
 *
 * useSearchParams suspends during prerender under Cache Components, which
 * forces the whole consumer subtree into a Suspense fallback and swaps its
 * DOM at hydration (clicks in that window land on detached nodes). This hook
 * renders the server snapshot ("" — matching the static shell) and applies
 * the real query string right after mount via useSyncExternalStore.
 *
 * Writers that change the URL programmatically (router.push/replace) must
 * call notifyUrlChange() afterwards — popstate only covers back/forward.
 */

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    window.removeEventListener("popstate", cb);
  };
}

export function notifyUrlChange() {
  for (const l of listeners) l();
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

/** Current query string ("?a=b" or ""), empty during prerender/hydration. */
export function useClientSearch(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
