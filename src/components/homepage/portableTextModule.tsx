import { type PortableTextModule } from "../../../sanity.types";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import Link from "next/link";

function PortableTextModuleComponent({
  portableTextModule,
}: {
  portableTextModule: PortableTextModule;
}) {
  return (
    <div className="w-[90%] px-2">
      <div
        className={`${portableTextModule.maxWidth} ${portableTextModule.textAlign}`}
      >
        {portableTextModule.title && (
          <h2 className="text-xl font-bold mb-6 mt-6">
            {portableTextModule.title}
          </h2>
        )}
        <PortableTextRenderer
          value={portableTextModule.content}
          className="text-sm"
        />
        {portableTextModule.link && (
          <Link
            href={portableTextModule.link}
            className="text-sm mt-2 flex items-center cursor-pointer"
            rel="noopener noreferrer"
          >
            {portableTextModule.linkText}
            <svg
              aria-hidden="true"
              viewBox="0 0 5 8"
              className="w-3 h-3 ml-2 text-black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        )}
        {portableTextModule.source && (
          <p className="text-sm text-gray-500 mt-2">
            {portableTextModule.source}
          </p>
        )}
      </div>
    </div>
  );
}

export default PortableTextModuleComponent;
