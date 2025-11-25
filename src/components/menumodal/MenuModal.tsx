import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import MenContent from "./MenContent";
import WomenContent from "./WomenContent";
import HelpContent from "./HelpContent";
import OurSpaceContent from "./OurSpaceContent";
import MenuContentSkeleton from "@/components/skeletons/MenuContentSkeleton";
import type { BrandMenuItem, MenuData, MenuConfig } from "@/types/menu";

const TABS = ["men", "women", "help", "Our Space"] as const;
type TabType = (typeof TABS)[number];

function MenuModal({
  isMenuOpen,
  setIsMenuOpen,
  menuData,
  brands,
  menuConfig,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  menuData?: MenuData;
  brands?: BrandMenuItem[];
  menuConfig?: MenuConfig;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set default tab when data is loaded
  useEffect(() => {
    if (menuData && Object.keys(menuData).length > 0 && activeTab === null) {
      setActiveTab("men");
    }
  }, [menuData, activeTab]);

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
          <div className="text-xs flex justify-between items-center h-8 relative mt-4 px-2">
            <span className="text-xs"></span>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`flex-1 text-xs py-2 ${
                activeTab === tab ? "border-b-[1.5px] border-black" : ""
              }`}
              onClick={() =>
                setActiveTab(activeTab === tab ? null : (tab as TabType))
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!isMounted || !menuData || Object.keys(menuData).length === 0 ? (
            <MenuContentSkeleton />
          ) : (
            <>
              {activeTab === "men" && (
                <MenContent
                  onClose={handleClose}
                  data={menuData["men"] || {}}
                  brands={brands}
                  featuredCollections={menuConfig?.men?.featuredCollections}
                />
              )}
              {activeTab === "women" && (
                <WomenContent
                  onClose={handleClose}
                  data={menuData["women"] || {}}
                  brands={brands}
                  featuredCollections={menuConfig?.women?.featuredCollections}
                />
              )}
              {activeTab === "help" && (
                <HelpContent
                  onClose={handleClose}
                  links={menuConfig?.help?.links}
                />
              )}
              {activeTab === "Our Space" && (
                <OurSpaceContent
                  onClose={handleClose}
                  links={menuConfig?.ourSpace?.links}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MenuModal;
