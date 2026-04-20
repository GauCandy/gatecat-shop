import type { NextConfig } from "next";

const appUrl = process.env.APP_URL;
const appHost = appUrl ? new URL(appUrl).host : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: appHost ? [appHost] : [],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
