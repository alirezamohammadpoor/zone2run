import { PortableText, type PortableTextProps } from "@portabletext/react";
import Image from "next/image";

interface PortableTextRendererProps {
  value: PortableTextProps["value"];
  className?: string;
}

export default function PortableTextRenderer({
  value,
  className = "",
}: PortableTextRendererProps) {
  if (!value) return null;

  return (
    <div className={className}>
      <PortableText
        value={value}
        components={{
          block: {
            normal: ({ children }) => (
              <p className="mb-4 md:mb-6 leading-relaxed text-xs">{children}</p>
            ),
            // CMS h1 renders as h2 to preserve page heading hierarchy (h1 is in hero)
            h1: ({ children }) => (
              <h2 className="text-sm mb-8 md:mb-10 mt-4 md:mt-6 first:mt-0">
                {children}
              </h2>
            ),
            h2: ({ children }) => (
              <h3 className="text-sm mb-6 md:mb-8 mt-4 md:mt-6">{children}</h3>
            ),
            h3: ({ children }) => (
              <h4 className="text-sm mb-4 mt-4">{children}</h4>
            ),
            h4: ({ children }) => (
              <h5 className="text-sm mb-4 mt-4">{children}</h5>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6 md:my-8 text-xs">
                {children}
              </blockquote>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            underline: ({ children }) => (
              <span className="underline">{children}</span>
            ),
            link: ({ children, value }) => (
              <a
                href={value.href}
                target={value.target === "_blank" ? "_blank" : undefined}
                rel={
                  value.target === "_blank" ? "noopener noreferrer" : undefined
                }
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            ),
          },
          types: {
            image: ({ value }) =>
              value?.asset?.url && (
                <div className="mb-4">
                  <div className="relative w-full h-[50vh] overflow-hidden">
                    <Image
                      src={value.asset.url}
                      alt={value.alt || ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    />
                  </div>
                  {value.alt && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      {value.alt}
                    </p>
                  )}
                </div>
              ),
          },
        }}
      />
    </div>
  );
}
