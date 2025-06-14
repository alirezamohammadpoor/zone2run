import React from "react";
import HeroButton from "./buttons/HeroButton";

function Hero() {
  return (
    <div className="w-full">
      {/* Main Hero Section */}
      <div className="flex w-full h-[90vh] bg-gray-200 items-center">
        <div className="text-black mt-auto mb-8">
          <h1 className="text-black text-4xl ml-4 font-bold">Hero Title</h1>
          <p className="text-black text-lg ml-4 mt-4">Hero Para</p>
          <HeroButton />
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="w-full h-screen">
        <div className="px-4 py-8">
          <h2 className="text-black text-4xl font-bold mb-2">New arrivals</h2>
          <div className="text-black text-lg font-medium">
            <div className="flex justify-between items-center">
              <span>Explore Summer '25 Delivery 01</span>
              <span className="mr-2">Shop Now</span>
            </div>
          </div>
          <hr className="w-full border-t border-black mt-4" />
        </div>

        <div className="flex w-full text-center items-center py-4">
          <span>Men's Tops</span>
          <span>Men's Bottoms</span>
          <span>Women's Tops</span>
          <span>Women's Bottoms</span>
        </div>

        <div className="grid grid-cols-2 gap-4 px-4 py-8">
          <div className="bg-gray-200 h-[300px] rounded-lg"></div>
          <div className="bg-gray-200 h-[300px] rounded-lg"></div>
          <div className="bg-gray-200 h-[300px] rounded-lg"></div>
          <div className="bg-gray-200 h-[300px] rounded-lg"></div>
        </div>
      </div>

      {/* Men's Section */}
      <div className="flex w-full h-[90vh] bg-gray-200 items-center mt-16">
        <div className="text-black mt-auto mb-8">
          <h2 className="text-black text-4xl ml-4 font-bold">Men's Title</h2>
          <p className="text-black text-lg ml-4 mt-4">Men's Para</p>
          <HeroButton />
        </div>
      </div>

      {/* Women's Section */}
      <div className="flex w-full h-[90vh] bg-gray-200 items-center mt-16">
        <div className="text-black mt-auto mb-8">
          <h2 className="text-black text-4xl ml-4 font-bold">Women's Title</h2>
          <p className="text-black text-lg ml-4 mt-4">Women's Para</p>
          <HeroButton />
        </div>
      </div>
    </div>
  );
}

export default Hero;
