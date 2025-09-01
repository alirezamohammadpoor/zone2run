"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllMainCategories } from "@/sanity/lib/getData";

function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllMainCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex gap-4 ml-2 mb-4">
      {categories.map((category: any) => (
        <button
          key={category._id}
          className="text-sm cursor-pointer hover:text-gray-500"
          onClick={() => {
            router.push(`/products/category/${category.slug.current}`);
          }}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}

export default CategoriesSection;
