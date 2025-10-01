import { type PortableTextModule } from "../../../sanity.types";
import PortableTextRenderer from "@/components/PortableTextRenderer";

function PortableTextModuleComponent({
  portableTextModule,
}: {
  portableTextModule: PortableTextModule;
}) {
  return (
    <div className="w-full ml-2">
      <div
        className={`${portableTextModule.maxWidth} ${portableTextModule.textAlign}`}
      >
        {portableTextModule.title && (
          <h2 className="text-xl font-bold mb-8">{portableTextModule.title}</h2>
        )}
        <PortableTextRenderer value={portableTextModule.content} />
      </div>
    </div>
  );
}

export default PortableTextModuleComponent;
