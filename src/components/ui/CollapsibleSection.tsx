import type { ReactNode } from "react";

interface CollapsibleSectionProps {
  isOpen: boolean;
  children: ReactNode;
  /** Animation duration in ms (default: 700) */
  duration?: number;
  /** Max height when open in px (default: 1000) */
  maxHeight?: number;
  className?: string;
}

/**
 * Animated collapsible section for accordions and expandable content.
 * Uses max-height + opacity transition for smooth animations.
 */
export function CollapsibleSection({
  isOpen,
  children,
  duration = 700,
  maxHeight = 1000,
  className = "",
}: CollapsibleSectionProps) {
  return (
    <div
      className={`overflow-hidden transition-all ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        maxHeight: isOpen ? `${maxHeight}px` : "0",
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
