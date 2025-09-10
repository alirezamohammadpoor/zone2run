import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import MenContent from "./MenContent";
import { menuConfig } from "./menuConfig";
import WomenContent from "./WomenContent";
import HelpContent from "./HelpContent";
import OurSpaceContent from "./OurSpaceContent";
import { getSubcategoriesByParentAndGender } from "@/sanity/lib/getData";
import { useEffect } from "react";

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

  const [menuData, setMenuData] = useState<{ [key: string]: any[] }>({});

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

  useEffect(() => {
    const fetchMenuData = async () => {
      // Fetch men's data
      const menTops = await getSubcategoriesByParentAndGender("tops", "men");
      const menBottoms = await getSubcategoriesByParentAndGender(
        "bottoms",
        "men"
      );
      const menOuterwear = await getSubcategoriesByParentAndGender(
        "outerwear",
        "men"
      );
      const menAccessories = await getSubcategoriesByParentAndGender(
        "accessories",
        "men"
      );
      const menShoes = await getSubcategoriesByParentAndGender("shoes", "men");

      // Fetch women's data
      const womenTops = await getSubcategoriesByParentAndGender(
        "tops",
        "women"
      );
      const womenBottoms = await getSubcategoriesByParentAndGender(
        "bottoms",
        "women"
      );
      const womenOuterwear = await getSubcategoriesByParentAndGender(
        "outerwear",
        "women"
      );
      const womenAccessories = await getSubcategoriesByParentAndGender(
        "accessories",
        "women"
      );
      const womenShoes = await getSubcategoriesByParentAndGender(
        "shoes",
        "women"
      );

      setMenuData({
        men: {
          tops: menTops,
          bottoms: menBottoms,
          outerwear: menOuterwear,
          accessories: menAccessories,
          shoes: menShoes,
        },
        women: {
          tops: womenTops,
          bottoms: womenBottoms,
          outerwear: womenOuterwear,
          accessories: womenAccessories,
          shoes: womenShoes,
        },
      });
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

        {/* Scrollable Content */}
        <div className="flex border-b border-gray-300">
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
        {activeTab === "men" && (
          <MenContent onClose={handleClose} data={menuData["men"]} />
        )}
        {activeTab === "women" && (
          <WomenContent onClose={handleClose} data={menuData["women"]} />
        )}
        {activeTab === "help" && (
          <HelpContent onClose={handleClose} data={menuData["help"]} />
        )}
        {activeTab === "Our Space" && (
          <OurSpaceContent onClose={handleClose} data={menuData["Our Space"]} />
        )}
      </div>
    </>
  );
}

export default MenuModal;
