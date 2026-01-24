"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmblaCarouselType } from "embla-carousel";

/**
 * Hook to track Embla carousel drag state.
 * Returns isDragging boolean and a click handler to prevent navigation during drag.
 */
export function useEmblaCarouselDrag(emblaApi: EmblaCarouselType | undefined) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = () => setIsDragging(false);
    const onScroll = () => setIsDragging(true);

    emblaApi.on("settle", onSettle);
    emblaApi.on("scroll", onScroll);

    return () => {
      emblaApi.off("settle", onSettle);
      emblaApi.off("scroll", onScroll);
    };
  }, [emblaApi]);

  /**
   * Click handler that prevents navigation during drag.
   * Use with onClick on carousel item links.
   */
  const handleDragClick = useCallback(
    (e: React.MouseEvent, onSuccess?: () => void) => {
      if (isDragging) {
        e.preventDefault();
      } else {
        onSuccess?.();
      }
    },
    [isDragging]
  );

  return { isDragging, handleDragClick };
}
