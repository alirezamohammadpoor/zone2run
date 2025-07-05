import React from "react";
import { useRouter } from "next/navigation";

function MenuModal({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Modal */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-white z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white z-10">
          {/* Modal Header */}
          <div className="text-xs flex justify-between items-center h-8 relative mt-6 px-4">
            <span>Menu</span>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-4"></div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-full">
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
