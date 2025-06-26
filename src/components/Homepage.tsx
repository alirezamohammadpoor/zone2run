import React from "react";
import HeroButton from "./buttons/HeroButton";
import Image from "next/image";

function Hero() {
  return (
    <div className="w-full">
      {/* Main Hero Section */}
      <div className="flex w-full h-[70vh] items-center relative">
        <Image src="/adidas.WEBP" alt="adidas" className="object-cover" fill />
        <div className="text-black mt-auto mb-8 z-10 relative">
          <h1 className="text-white text-4xl ml-4 font-bold">Hero Title</h1>
          <p className="text-white text-lg ml-4 mt-4">Hero Para</p>
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
              <span className="mr-2">View All</span>
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
      <div className="flex w-full h-[70vh] items-center mt-16 relative">
        <Image src="/arc.WEBP" alt="arc" className="object-cover" fill />
        <div className="text-black mt-auto mb-8 z-10 relative">
          <h2 className="text-black text-4xl ml-4 font-bold">Men's Title</h2>
          <p className="text-black text-lg ml-4 mt-4">Men's Para</p>
          <HeroButton />
        </div>
      </div>

      {/* Women's Section */}
      <div className="flex w-full h-[70vh] items-center mt-16 relative">
        <Image src="/nike.WEBP" alt="nike" className="object-cover" fill />
        <div className="text-black mt-auto mb-8 z-10 relative">
          <h2 className="text-black text-4xl ml-4 font-bold">Women's Title</h2>
          <p className="text-black text-lg ml-4 mt-4">Women's Para</p>
          <HeroButton />
        </div>
      </div>

      {/* Run Club */}
      <div className="bg-black px-4 py-8">
        <h2 className="text-white text-3xl font-medium mb-2">
          Join the Movement
        </h2>
        <div className="text-white text-lg">
          <div className="flex justify-between items-center">
            <span>
              Run smarter, not harder. The Zone 2 Run Club brings together
              athletes who value consistency, recovery, and community. Weekly
              runs, post-session recovery, and a shared commitment to
              sustainable progress
            </span>
            <span className="mr-2"></span>
          </div>
        </div>
        <hr className="w-full border-t border-black mt-4" />
      </div>
      <div className="bg-gray-200 h-[40vh]"></div>

      {/* Playlists*/}
      <div className="bg-black px-4 py-8">
        <h2 className="text-white text-3xl font-medium mb-2">Distance Tapes</h2>
        <div className="text-white text-lg">
          <div className="flex justify-between items-center">
            <span>
              Running is tempo. Built to match your stride — steady beats, clear
              rhythm, no skips. Curated to move with you and fuel your flow.
            </span>
            <span className="mr-2"></span>
          </div>
        </div>
        <hr className="w-full border-t border-black mt-4" />
      </div>
      <div className="bg-gray-200 h-[40vh]"></div>
    </div>
  );
}

export default Hero;
