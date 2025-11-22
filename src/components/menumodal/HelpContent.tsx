"use client";

import { useRouter } from "next/navigation";

function HelpContent({
  onClose,
  links,
}: {
  onClose: () => void;
  links?: Array<{ label: string; url: string; _key?: string }>;
}) {
  const router = useRouter();

  const handleLinkClick = (url: string) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      router.push(url);
      onClose();
    }
  };

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
          <button
            key={link._key || index}
            className="text-xs hover:text-gray-500 text-left w-full block"
            onClick={() => handleLinkClick(link.url)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HelpContent;
