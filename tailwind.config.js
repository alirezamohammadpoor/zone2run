/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "Lucida Grande",
          "sans-serif",
        ],
      },
      // Design tokens
      spacing: {
        "touch-target": "44px", // WCAG minimum touch target
      },
      aspectRatio: {
        product: "4 / 5", // Standard product card ratio
      },
      gridTemplateColumns: {
        plp: "repeat(2, 1fr)", // Mobile PLP grid
        "plp-xl": "repeat(4, 1fr)", // Desktop PLP grid
      },
    },
  },
  plugins: [],
};
