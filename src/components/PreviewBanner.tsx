"use client";

import LocaleLink from "@/components/LocaleLink";

export default function PreviewBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full flex items-center gap-3 text-xs shadow-lg">
      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>Preview</span>
      <LocaleLink
        href="/api/disable-draft"
        className="bg-white text-black px-2 py-0.5 rounded-full font-medium hover:bg-gray-200 transition-colors"
      >
        Exit
      </LocaleLink>
    </div>
  );
}
