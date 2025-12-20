"use client";

interface MuxVideoProps {
  playbackId: string;
}

export default function MuxVideo({ playbackId }: MuxVideoProps) {
  // @mux/mux-player package was removed
  // This component is kept for schema compatibility but renders a placeholder
  return (
    <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">
        Video player not available (Mux package removed)
      </p>
      <p className="text-xs text-gray-400 mt-2">Playback ID: {playbackId}</p>
    </div>
  );
}
