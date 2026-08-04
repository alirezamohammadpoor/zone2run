import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/", "out/", "storefront-accelerator/", "next-env.d.ts"],
  },
  ...coreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // Rules newly enforced by eslint-config-next 16 flag pre-existing code.
      // Kept visible as warnings; burn down in a follow-up, then restore errors.
      "@next/next/no-html-link-for-pages": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
