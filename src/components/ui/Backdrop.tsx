interface BackdropProps {
  isOpen: boolean;
  onClick: () => void;
  /** Blur effect (default: true) */
  blur?: boolean;
}

/**
 * Modal backdrop overlay with opacity transition.
 * Handles click-outside-to-close functionality.
 */
export function Backdrop({ isOpen, onClick, blur = true }: BackdropProps) {
  return (
    <div
      className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
        blur ? "backdrop-blur-sm" : ""
      } ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={onClick}
      role="presentation"
      aria-hidden="true"
    />
  );
}
