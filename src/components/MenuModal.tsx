import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import MenContent from "./product/MenContent";

function MenuModal({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "men" | "women" | "customer service" | "our space" | null
  >(null);

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
        <div className="flex border-b border-gray-300">
          {["men", "women", "customer", "journal"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-3 text-sm ${
                activeTab === tab ? "border-b-2 border-black" : ""
              }`}
              onClick={() =>
                setActiveTab(
                  activeTab === tab ? null : (tab as typeof activeTab)
                )
              }
            >
              {tab === "men"
                ? "Men"
                : tab === "women"
                ? "Women"
                : tab === "customer"
                ? "Customer Service"
                : "Journal"}
            </button>
          ))}
        </div>
        {activeTab === "men" && <MenContent />}
      </div>
    </>
  );
}

export default MenuModal;
