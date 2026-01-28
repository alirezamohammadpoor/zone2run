"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useModalScroll } from "@/hooks/useModalScroll";

// Lazy load FocusLock - only needed when modal is visible
const FocusLock = dynamic(() => import("react-focus-lock"), { ssr: false });
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import GenderMenuContent from "./GenderMenuContent";
import HelpContent from "./HelpContent";
import OurSpaceContent from "./OurSpaceContent";
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
    <FocusLock disabled={!isMenuOpen}>
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        inert={!isMenuOpen ? true : undefined}
        className={
          "fixed top-0 left-0 h-[100dvh] w-full bg-white z-50 transform transition-transform duration-300 overflow-hidden flex flex-col" +
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
              aria-label="Close navigation menu"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div role="tablist" className="flex flex-shrink-0">
          {TABS.map((tab) => {
            const tabId = tab.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tabpanel-${tabId}`}
                id={`tab-${tabId}`}
                className={`flex-1 text-xs py-2 ${
                  activeTab === tab ? "border-b-[1.5px] border-black" : ""
                }`}
                onClick={() =>
                  setActiveTab(activeTab === tab ? null : (tab as TabType))
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Area */}
        <div
          role="tabpanel"
          id={activeTab ? `tabpanel-${activeTab.toLowerCase().replace(/\s+/g, '-')}` : undefined}
          aria-labelledby={activeTab ? `tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}` : undefined}
          className="flex-1 overflow-y-auto"
        >
          {!isMounted || !menuData || Object.keys(menuData).length === 0 ? null : (
            <>
              {activeTab === "men" && (
                <GenderMenuContent
                  gender="mens"
                  onClose={handleClose}
                  data={menuData["men"] || {}}
                  brands={brands}
                  featuredCollections={menuConfig?.men?.featuredCollections}
                />
              )}
              {activeTab === "women" && (
                <GenderMenuContent
                  gender="womens"
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
    </FocusLock>
  );
}

export default MenuModal;
