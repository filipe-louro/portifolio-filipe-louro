import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/playground", destination: "/", permanent: true },
      { source: "/projects/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
