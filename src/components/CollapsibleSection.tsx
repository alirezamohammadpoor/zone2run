"use client";

import { useState } from "react";

type SectionProps = {
  title: string;
  content: string;
};

export default function CollapsibleSection({ title, content }: SectionProps) {
  const [open, setOpen] = useState(false);
  const contentId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="border-b py-3">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-[95%] text-left flex justify-between items-center ml-2"
      >
        <span className="font-medium text-sm uppercase">{title}</span>
        <span className="text-xl" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      <div
        id={contentId}
        className={`mt-2 ml-2 text-sm text-gray-700 whitespace-pre-line ${open ? "" : "hidden"}`}
        aria-hidden={!open}
      >
        {content}
      </div>
    </div>
  );
}
