// Quiet fallback (no skeletons by design): reserve the hero's space as
// whitespace so the streamed post replaces it without reflow.
export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="w-full h-[60vh] mb-8 md:mb-12 xl:mb-16" />
    </div>
  );
}
