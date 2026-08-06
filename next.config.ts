import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ekgozxcqkjzzamrgiyal.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.electrolux.vn",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
