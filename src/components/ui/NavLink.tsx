import Link from "next/link";

interface NavLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  external?: boolean;
}

/**
 * Standardized navigation link for menu modals and navigation lists.
 * Base styles: text-xs, hover:text-gray-500, full-width block layout.
 * Supports both internal (Next.js Link) and external (<a>) links.
 */
export function NavLink({
  href,
  onClick,
  children,
  className,
  prefetch,
  external,
}: NavLinkProps) {
  const baseStyles = "text-xs hover:text-gray-500 text-left w-full block";
  const combinedStyles = className ? `${baseStyles} ${className}` : baseStyles;

  // External link
  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedStyles}
      >
        {children}
      </a>
    );
  }

  // Internal link
  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={prefetch}
      className={combinedStyles}
    >
      {children}
    </Link>
  );
}
