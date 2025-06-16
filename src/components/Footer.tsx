import React from "react";

function Footer() {
  return (
    <>
      <footer>
        <div className="border-b border-gray-200"></div>
        <nav className="flex w-full py-8 ml-2">
          <div className="flex flex-col w-1/2">
            <p className="mb-4 font-semibold">Zone 2</p>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-gray-600">
                  About
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col w-1/2">
            <p className="mb-4 font-semibold">Support</p>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-gray-600">
                  Contact us
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  Payment Methods
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <nav className="flex w-full py-8">
          <div className="flex flex-col w-1/2 ml-2">
            <p className="mb-4 font-semibold">Socials</p>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-gray-600">
                  Instagram
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  TikTok
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-gray-600">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col w-1/2">
            <p className="mb-4 font-semibold">Powered by Shopify</p>
          </div>
        </nav>
      </footer>
    </>
  );
}

export default Footer;
