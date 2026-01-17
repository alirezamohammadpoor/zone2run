"use client";

import Link from "next/link";

function OurSpaceContent({
  onClose,
  links,
}: {
  onClose: () => void;
  links?: Array<{ label: string; url: string; _key?: string }>;
}) {
  return (
    <div className="px-2 py-2">
      <h2 className="text-sm font-semibold mb-4">Our Space</h2>
      <div className="space-y-2">
        <Link
          href="/blog"
          onClick={onClose}
          className="text-xs hover:text-gray-500 text-left w-full block"
        >
          View All Editorials
        </Link>
        {links?.map((link, index) =>
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

export default OurSpaceContent;
