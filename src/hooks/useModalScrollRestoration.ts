import { useScrollStore } from "@/store/scroll";

export function useModalScrollRestoration() {
  const { scrollY, setScrollY } = useScrollStore();

  const lockScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    // Calculate scrollbar width before locking
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll without jump using position: fixed
    document.body.style.position = "fixed";
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";
    // Add padding to compensate for scrollbar disappearing
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Also apply to fixed header
    const header = document.querySelector("header");
    if (header) {
      (header as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const unlockScroll = () => {
    const savedScrollY = scrollY;

    // Reset body styles
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.paddingRight = "";

    // Reset header padding
    const header = document.querySelector("header");
    if (header) {
      (header as HTMLElement).style.paddingRight = "";
    }

    // Restore scroll
    window.scrollTo(0, savedScrollY);
  };

  return { lockScroll, unlockScroll };
}
