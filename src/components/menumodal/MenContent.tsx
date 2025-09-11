"use client";

import { getMainCategoryBySub } from "@/sanity/lib/getData";
import { useRouter } from "next/navigation";

function MenContent({ onClose, data }: { onClose: () => void; data: any }) {
  const router = useRouter();

  const handleSubcategoryClick = async (subcategorySlug: string) => {
    const subcategoryData = await getMainCategoryBySub(subcategorySlug);
    if (subcategoryData?.parentCategory) {
      router.push(
        `/products/category/men/${subcategoryData.parentCategory.slug.current}/${subcategorySlug}`
      );
      onClose();
    }
  };

  return (
    <div className="p-4">
      {Object.entries(data || {}).map(([category, subcategories]) => (
        <div key={category} className="mb-6">
          <h3 className="font-semibold text-lg mb-3 capitalize">{category}</h3>
          <ol className="space-y-2">
            {(subcategories as any[]).map((subcategory: any) => (
              <li
                key={subcategory._id}
                className="text-sm cursor-pointer hover:text-gray-500 pl-2"
                onClick={() => handleSubcategoryClick(subcategory.slug.current)}
              >
                {subcategory.title}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default MenContent;
