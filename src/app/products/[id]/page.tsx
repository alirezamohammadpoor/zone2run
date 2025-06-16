import { getProductByHandle } from "@/lib/shopify/products";
import Image from "next/image";
import AddToCart from "@/components/buttons/AddToCart";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProductDescription from "@/components/ProductDescription";

// Add this function to help with dynamic routing
export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    // Add more IDs as needed
  ];
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div>
      <span className="text-sm text-gray-500">
        Zone 2 {">"} Men's {">"} Tops
      </span>
      <div className="w-full h-[70vh] bg-gray-200 mt-4"></div>
      <div className="flex justify-between items-center mt-4">
        <span className="ml-2">Product Name</span>
        <span className="mr-2">500 SEK</span>
      </div>

      <div className="max-w-md mx-auto p-4 mt-4">
        <h3 className="mb-2 text-sm font-medium">Select Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {/* Example of available sizes */}
          <button className="py-2 px-4 border rounded text-center hover:bg-black hover:text-white">
            XS
          </button>
          <button className="py-2 px-4 border rounded text-center hover:bg-black hover:text-white">
            S
          </button>
          <button className="py-2 px-4 border rounded text-center hover:bg-black hover:text-white">
            M
          </button>
          <button className="py-2 px-4 border rounded text-center hover:bg-black hover:text-white">
            L
          </button>
          <button className="py-2 px-4 border rounded text-center hover:bg-black hover:text-white">
            XL
          </button>
          <button
            className="py-2 px-4 border rounded text-center cursor-not-allowed text-gray-400 bg-gray-100"
            disabled
          >
            XXL
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Find your size with our size guide.
        </p>
      </div>

      <AddToCart />

      <ProductDescription />

      <CollapsibleSection
        title="Product Details"
        content="Your product details content here"
      />

      <CollapsibleSection
        title="Wash and care"
        content="Your wash and care content here"
      />

      <CollapsibleSection
        title="Shipping and returns"
        content="Your shipping and returns content here"
      />

      <CollapsibleSection
        title="Secure payments"
        content="Your secure payments content here"
      />

      <div className="mt-12 mb-12 ml-2">
        <h3 className="font-medium text-sm uppercase mb-2">Related Products</h3>

        <div className="mt-12 mb-12">
          <h3 className="text-2xl font-medium uppercase mb-2">
            The Race Collection
          </h3>
        </div>
      </div>
    </div>
  );
}
