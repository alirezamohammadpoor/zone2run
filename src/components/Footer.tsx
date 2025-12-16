import Link from "next/link";

function Footer() {
  return (
    <>
      <footer>
        <div className="border-b border-gray-200"></div>
        <nav className="flex w-full py-8 ml-2 text-xs">
          <div className="flex flex-col w-1/2">
            <p className="mb-4 text-base">Zone 2</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gray-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col w-1/2">
            <p className="mb-4 text-base">Support</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Payment Methods
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <nav className="flex w-full py-8 text-xs">
          <div className="flex flex-col w-1/2 ml-2">
            <p className="mb-4 text-base">Socials</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gray-600">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  TikTok
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-600">
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col w-1/2">
            <p className="mb-4 text-base">Powered by Shopify</p>
          </div>
        </nav>
      </footer>
    </>
  );
}

export default Footer;
