"use client";

import { NavLink } from "@/components/ui/NavLink";

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
        <NavLink href="/blog" onClick={onClose}>
          View All Editorials
        </NavLink>
        {links?.map((link, index) => (
          <NavLink key={link._key || index} href={link.url} onClick={onClose}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default OurSpaceContent;
