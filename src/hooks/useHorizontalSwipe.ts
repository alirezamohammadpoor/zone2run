"use client";

import { useRef, useState } from "react";

export function useHorizontalSwipe(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = false;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - startXRef.current);
    const deltaY = Math.abs(e.touches[0].clientY - startYRef.current);

    // If moved more than 5px, consider it a drag/scroll
    if (deltaX > 5 || deltaY > 5) {
      isDraggingRef.current = true;
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentIndex(Math.min(index, itemCount - 1));
    }
  };

  return {
    scrollRef,
    isDraggingRef,
    currentIndex,
    handleTouchStart,
    handleTouchMove,
    handleScroll,
  };
}
