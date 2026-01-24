"use client";

import { NavLink } from "@/components/ui/NavLink";

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
        {links.map((link, index) => (
          <NavLink
            key={link._key || index}
            href={link.url}
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default HelpContent;
