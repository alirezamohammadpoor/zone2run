// Quiet fallback (no skeletons by design): reserves the PDP's gallery/info
// geometry as whitespace so the streamed page replaces it without reflow.
export default function Loading() {
  return (
    <div className="xl:flex xl:flex-row">
      <div className="w-full xl:w-1/2">
        <div className="w-full aspect-[4/5]" />
      </div>
      <div className="w-full px-2 xl:w-1/2 xl:flex xl:flex-col xl:justify-center xl:items-center">
        <div className="w-full xl:max-w-md pt-4">
          <div className="h-40" />
          <div className="h-[50px] mt-6" />
        </div>
      </div>
    </div>
  );
}
