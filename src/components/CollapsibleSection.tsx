"use client";

import { useState } from "react";

type SectionProps = {
  title: string;
  content: string;
};

export default function CollapsibleSection({ title, content }: SectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-[95%] text-left flex justify-between items-center ml-2"
      >
        <span className="font-medium text-sm uppercase">{title}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-2 ml-2 text-sm text-gray-700 whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}
