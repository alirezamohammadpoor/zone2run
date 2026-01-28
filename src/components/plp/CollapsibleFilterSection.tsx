"use client";

import { useState, type ReactNode } from "react";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

interface CollapsibleFilterSectionProps {
  title: string;
  children: ReactNode;
  /** Whether section is open by default */
  defaultOpen?: boolean;
  /** Count to display next to title (e.g., active filter count) */
  count?: number;
}

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${
      isOpen ? "rotate-180" : ""
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export function CollapsibleFilterSection({
  title,
  children,
  defaultOpen = false,
  count,
}: CollapsibleFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">
          {title}
          {count !== undefined && count > 0 && (
            <span className="ml-1 text-gray-500">({count})</span>
          )}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      <CollapsibleSection isOpen={isOpen} maxHeight={1000}>
        <div className="px-4 pb-4">{children}</div>
      </CollapsibleSection>
    </div>
  );
}
