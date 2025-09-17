import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import {
  getSubcategoriesByParentAndGender,
  getAllMainCategories,
} from "@/sanity/lib/getData";
import MenContent from "./MenContent";
import WomenContent from "./WomenContent";
import HelpContent from "./HelpContent";
import OurSpaceContent from "./OurSpaceContent";
import { menuConfig } from "./menuConfig";

function MenuModal({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<keyof typeof menuConfig | null>(
    null
  );

  const [menuData, setMenuData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Fetch main categories dynamically from Sanity
        const mainCategories = await getAllMainCategories();

        if (!mainCategories || mainCategories.length === 0) {
          console.warn("No main categories found");
          return;
        }

        const genders = ["men", "women"];
        const data: { [key: string]: any } = {};

        for (const gender of genders) {
          data[gender] = {};

          for (const category of mainCategories) {
            if (!category.slug?.current) {
              console.warn(`Category ${category.title} has no slug`);
              continue;
            }

            try {
              const subcategories = await getSubcategoriesByParentAndGender(
                category.slug.current,
                gender
              );
              data[gender][category.slug.current] = subcategories || [];
            } catch (categoryError) {
              console.error(
                `Error fetching subcategories for ${category.slug.current}:`,
                categoryError
              );
              data[gender][category.slug.current] = [];
            }
          }
        }

        setMenuData(data);
        // Set default tab to "men" after data is loaded
        setActiveTab("men");
      } catch (error) {
        console.error("Error fetching menu data:", error);
        // Set empty data structure to prevent UI errors
        setMenuData({ men: {}, women: {} });
        setActiveTab("men");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300 flex-shrink-0">
          {Object.keys(menuConfig).map((tab) => (
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!isMounted || isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <>
              {activeTab === "men" && (
                <MenContent
                  onClose={handleClose}
                  data={menuData["men"] || {}}
                />
              )}
              {activeTab === "women" && (
                <WomenContent
                  onClose={handleClose}
                  data={menuData["women"] || {}}
                />
              )}
              {activeTab === "help" && (
                <HelpContent
                  onClose={handleClose}
                  data={menuData["help"] || {}}
                />
              )}
              {activeTab === "Our Space" && (
                <OurSpaceContent
                  onClose={handleClose}
                  data={menuData["Our Space"] || {}}
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