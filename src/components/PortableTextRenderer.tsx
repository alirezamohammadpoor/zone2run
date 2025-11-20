import { PortableText } from "@portabletext/react";
import Image from "next/image";

interface PortableTextRendererProps {
  value: any;
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
              <p className="mb-4 leading-relaxed">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold mb-8 mt-4 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold mb-6 mt-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-bold mb-4 mt-4">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xl font-bold mb-4 mt-4">{children}</h4>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6">
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
                    <p className="text-md text-gray-600 mt-2 italic">
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
