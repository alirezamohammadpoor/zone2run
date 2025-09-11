"use client";

function OurSpaceContent({
  onClose,
  data,
}: {
  onClose: () => void;
  data: any;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Our Space</h2>
      <div className="space-y-4">
        <p className="text-gray-600">
          This section will contain information about our physical space,
          events, and community.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">
            Placeholder content - Our Space section coming soon
          </p>
        </div>
      </div>
    </div>
  );
}

export default OurSpaceContent;
