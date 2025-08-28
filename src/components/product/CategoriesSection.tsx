"use client";
import React, { useEffect, useState } from "react";
import { getAllCategories } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";

function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await client.fetch(getAllCategories);
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
            setSelectedCategory(category.slug.current);
          }}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
}

export default CategoriesSection;
