import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos can be pasted as any https URL from the admin screen,
    // and uploads are served locally from /api/images/<id>.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
