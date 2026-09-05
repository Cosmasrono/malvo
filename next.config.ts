import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero renders at quality 90; Next 16 requires every used value here.
    qualities: [75, 90],
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
