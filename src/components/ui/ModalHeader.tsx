interface ModalHeaderProps {
  title: string;
  titleId?: string;
  onClose: () => void;
  /** Show bottom border (default: false) */
  bordered?: boolean;
}

/**
 * Standardized modal header with title and close button.
 * Matches the existing Zone2Run design language.
 */
export function ModalHeader({
  title,
  titleId,
  onClose,
  bordered = false,
}: ModalHeaderProps) {
  return (
    <div
      className={`flex-shrink-0 bg-white z-10 h-12 xl:h-16 ${
        bordered ? "border-b border-gray-300" : ""
      }`}
    >
      <div className="text-xs flex justify-between items-center h-full px-2">
        <span id={titleId}>{title}</span>
        <button
          className="text-xs hover:text-gray-500"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()}`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
