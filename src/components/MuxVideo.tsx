"use client";

import { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": any;
    }
  }
}

interface MuxVideoProps {
  playbackId: string;
}

export default function MuxVideo({ playbackId }: MuxVideoProps) {
  useEffect(() => {
    import("@mux/mux-player");
  }, []);

  return (
    <mux-player
      style={{ width: "100%", height: "auto" }}
      playback-id={playbackId}
      controls
      autoplay
      muted
      loop
    />
  );
}
