import Link from "next/link";
import {
  getFooterSettings,
  type FooterColumn,
  type FooterLink,
} from "@/sanity/lib/getSettings";
import NewsletterSignup from "./footer/NewsletterSignup";

// Black sticky footer that reveals when scrolling past FooterContent
export function StickyFooter() {
  return (
    <footer className="sticky bottom-0 z-[-1] w-full bg-black">
      <div className="py-24 flex items-center justify-center">
        <h1 className="text-8xl text-white">ZONE 2</h1>
      </div>
    </footer>
  );
}

// Render a single link
function FooterLink({ link }: { link: FooterLink }) {
  if (link.isExternal) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-600"
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.url} className="hover:text-gray-600">
      {link.label}
    </Link>
  );
}

// Render a column of links
function FooterColumnComponent({
  column,
  className,
}: {
  column?: FooterColumn;
  className?: string;
}) {
  if (!column?.title && !column?.links?.length) return null;

  return (
    <div className={`flex flex-col ${className || ""}`}>
      {column.title && <p className="mb-4 text-sm">{column.title}</p>}
      {column.links && column.links.length > 0 && (
        <ul className="space-y-2">
          {column.links.map((link, idx) => (
            <li key={`${link.url}-${idx}`}>
              <FooterLink link={link} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// White footer with navigation links - Server Component
export async function FooterContent() {
  const footer = await getFooterSettings();

  return (
    <footer className="relative z-10 bg-white">
      <div className="border-b border-gray-200" />
      <div className="px-2 pt-8">
        <NewsletterSignup newsletter={footer?.newsletter} />
      </div>
      <nav className="grid grid-cols-2 xl:grid-cols-3 gap-8 w-full py-8 px-2 text-xs">
        <FooterColumnComponent column={footer?.column1} />
        <FooterColumnComponent column={footer?.column2} />
        <FooterColumnComponent
          column={footer?.column3}
          className="col-span-2 xl:col-span-1"
        />
      </nav>
      {footer?.copyrightText && (
        <div className="px-2 pb-4 text-xs text-gray-500">
          {footer.copyrightText}
        </div>
      )}
      <div className="h-32" />
    </footer>
  );
}
