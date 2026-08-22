import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.electrolux.vn",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/support/maintenance", destination: "/services/maintenance", permanent: true },
      { source: "/support/fixed-price-repair", destination: "/services/fixed-price-repair", permanent: true },
      { source: "/support/warranty-extension", destination: "/services/warranty-extension", permanent: true },
      { source: "/support/book-service", destination: "/support/warranty-appointment", permanent: true },
      { source: "/support/warranty-registration", destination: "/support/product-registration", permanent: true },
      { source: "/support/track", destination: "/support", permanent: true },
    ];
  },
};

export default nextConfig;
