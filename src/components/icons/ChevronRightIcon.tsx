interface ChevronRightIconProps {
  className?: string;
  /** Rotation in degrees (0, 90, 180, 270) */
  rotate?: number;
  /** For animated rotation, use CSS transition instead of static transform */
  animated?: boolean;
}

export function ChevronRightIcon({
  className = "w-2 h-2",
  rotate = 0,
  animated = false,
}: ChevronRightIconProps) {
  const style = animated
    ? {
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.3s ease-in-out",
      }
    : rotate !== 0
      ? { transform: `rotate(${rotate}deg)` }
      : undefined;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 5 8"
      style={style}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
        fill="currentColor"
      />
    </svg>
  );
}
