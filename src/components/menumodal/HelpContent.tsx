"use client";

import Link from "next/link";

function HelpContent({
  onClose,
  links,
}: {
  onClose: () => void;
  links?: Array<{ label: string; url: string; _key?: string }>;
}) {
  if (!links || links.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
        <p className="text-gray-500">No help links configured.</p>
      </div>
    );
  }

  return (
    <div className="px-2 py-2">
      <h2 className="text-sm font-semibold mb-4">Help & Support</h2>
      <div className="space-y-2">
        {links.map((link, index) =>
          link.url.startsWith("http") ? (
            <a
              key={link._key || index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:text-gray-500 text-left w-full block"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link._key || index}
              href={link.url}
              onClick={onClose}
              className="text-xs hover:text-gray-500 text-left w-full block"
            >
              {link.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

export default HelpContent;
