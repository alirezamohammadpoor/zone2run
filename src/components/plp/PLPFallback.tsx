/**
 * Quiet fallback for streamed PLP grids (category, brand, collection, search).
 *
 * No skeletons by design (store-wide rule): the old flat `min-h-screen` div
 * followed the same rule but reserved one untyped block, so the streamed
 * title/filter/grid re-flowed everything below it (CLS 0.47–0.82 on staging).
 * This reserves the same geometry the grid will occupy — pure whitespace plus
 * the one label that is static anyway — so the swap is paint-only.
 */
export default function PLPFallback({ cards = 8 }: { cards?: number }) {
  return (
    <div className="min-h-screen">
      <div className="px-2 pt-4">
        <div className="h-10" />
        <div className="flex justify-between items-center pt-6">
          <span className="text-xs">Filter</span>
          <span className="h-4" />
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 px-2 my-8 md:my-12 xl:my-16">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="aspect-[4/5] flex flex-col">
            <div className="w-full h-full" />
            <div className="pt-2 pb-4">
              <div className="h-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
