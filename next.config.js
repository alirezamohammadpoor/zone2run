/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "cdn.midjourney.com",
      },
    ],
  },

  // Performance optimizations
  experimental: {
    // Enable faster builds
    optimizePackageImports: ["@sanity/client", "lucide-react"],
  },

  // External packages for server components
  // Note: Removed @sanity/client to avoid conflict with transpilePackages
  serverExternalPackages: [],

  // Webpack optimizations (only when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when not using Turbopack
    // Check if we're running with --turbo flag
    const isTurbopack =
      process.argv.includes("--turbo") || process.argv.includes("--turbopack");

    if (dev && !isTurbopack) {
      // Optimize file watching in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/public/**",
        ],
      };

      // Reduce memory usage
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
