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
      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Menu</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-6">
          <div className="space-y-4">
            <button
              onClick={() => handleNavigate("/")}
              className="block w-full text-left py-2 hover:text-gray-600"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate("/products")}
              className="block w-full text-left py-2 hover:text-gray-600"
            >
              Products
            </button>
            <button
              onClick={() => handleNavigate("/about")}
              className="block w-full text-left py-2 hover:text-gray-600"
            >
              About
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

export default MenuModal;
