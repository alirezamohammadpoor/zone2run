export default function Loading() {
  return (
    <div className="xl:flex xl:flex-row">
      {/* Gallery */}
      <div className="w-full xl:w-1/2">
        <div className="w-full aspect-[4/5] bg-gray-100 animate-pulse" />
      </div>
      {/* Product info */}
      <div className="w-full px-2 xl:w-1/2 xl:flex xl:flex-col xl:justify-center xl:items-center">
        <div className="w-full xl:max-w-md pt-4 space-y-3">
          <div className="h-3 w-1/3 bg-gray-100 animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-100 animate-pulse" />
          <div className="h-3 w-1/4 bg-gray-100 animate-pulse" />
          <div className="h-10 w-full bg-gray-100 animate-pulse mt-6" />
          <div className="h-[50px] w-full bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
