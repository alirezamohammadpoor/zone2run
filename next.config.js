/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  turbopack: {},
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
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable optimization in development to prevent timeouts
    unoptimized: process.env.NODE_ENV === "development",
  },

  experimental: {
    optimizePackageImports: ["@sanity/client", "lucide-react"],
  },

  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when not using Turbopack
    const isTurbopack =
      process.argv.includes("--turbo") || process.argv.includes("--turbopack");

    if (dev && !isTurbopack) {
      // Optimize file watching in development
      config.watchOptions = {
        // Remove polling - let Next.js use native file watching
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/public/**",
          "**/tsconfig.tsbuildinfo",
          "**/.next/types/**",
        ],
      };
    }

    // Better code splitting for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Separate Sanity Studio into its own chunk
            sanityStudio: {
              test: /[\\/]node_modules[\\/](next-sanity|sanity|@sanity)[\\/]/,
              name: "sanity-studio",
              priority: 30,
              chunks: "async",
            },
            // Vendor chunk for other node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              chunks: "all",
            },
            // Common chunk for shared code
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  serverExternalPackages: [],

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = withBundleAnalyzer(nextConfig);
