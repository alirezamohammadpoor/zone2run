import React from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";

function MenuModal({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();

  const { unlockScroll } = useModalScrollRestoration();

  const handleClose = () => {
    setIsMenuOpen(false);
    // Delay scroll restoration to allow modal animation to complete
    setTimeout(() => {
      unlockScroll();
    }, 300);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    handleClose();
  };

  // Prevent body scroll when modal is open
  useModalScroll(isMenuOpen);

  return (
    <>
      {/* Modal */}
      <div
        className={
          "fixed top-0 left-0 h-screen w-full bg-white z-50 transform transition-transform duration-300 overflow-hidden flex flex-col" +
          (isMenuOpen ? " translate-x-0" : " -translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="bg-white z-10 h-16 flex-shrink-0">
          {/* Modal Header */}
          <div className="text-xs flex justify-between items-center h-8 relative mt-4 px-4">
            <span className="text-sm font-bold">Zone 2</span>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-2"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Menu */}
          <div className="mt-4 flex justify-center">
            <div className="w-[100%] mx-auto px-4 py-2 text-xl font-light">
              Navigation
            </div>
          </div>

          <span className="text-gray-500 text-sm ml-4 block mt-16">
            Main pages
          </span>

          <span
            className="text-sm font-normal ml-4 block mt-4"
            onClick={() => {
              handleNavigate("/");
              setIsMenuOpen(false);
            }}
          >
            Home
          </span>
          <span
            className="text-sm font-normal ml-4 block mt-2"
            onClick={() => {
              handleNavigate("/products");
              setIsMenuOpen(false);
            }}
          >
            Products
          </span>
          <span
            className="text-sm font-normal ml-4 block mt-2"
            onClick={() => {
              handleNavigate("/about");
              setIsMenuOpen(false);
            }}
          >
            About
          </span>

          <span className="text-gray-500 text-sm ml-4 block mt-16">
            Support
          </span>

          <span className="text-sm font-normal ml-4 block mt-4">FAQ</span>
          <span className="text-sm font-normal ml-4 block mt-2">
            Contact us
          </span>
          <span className="text-sm font-normal ml-4 block mt-2">About us</span>
        </div>
      </div>
    </>
  );
}

export default MenuModal;
