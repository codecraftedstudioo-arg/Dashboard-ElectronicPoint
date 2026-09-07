import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Next.js 16 still applies this from experimental.serverActions at runtime.
  experimental: {
    serverActions: {
      // Single compressed photo uploads stay well under this; kept high for safety.
      bodySizeLimit: "10mb",
    },
    proxyClientMaxBodySize: "10mb",
  },
  images: {
    // Product photos are already compressed client-side. Vercel Image
    // Optimization returns 402 (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED)
    // on this plan, which broke every next/image except cached ones.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
