import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/api/v1/profile/avatar/**" },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [
      { source: "/api/v1/auth/:path*", destination: `${backendUrl}/api/v1/auth/:path*` },
      { source: "/api/v1/profile", destination: `${backendUrl}/api/v1/profile` },
      { source: "/api/v1/profile/", destination: `${backendUrl}/api/v1/profile/` },
      { source: "/api/v1/profile/avatar", destination: `${backendUrl}/api/v1/profile/avatar` },
      { source: "/api/v1/profile/avatar/", destination: `${backendUrl}/api/v1/profile/avatar/` },
      { source: "/api/v1/profile/:path*", destination: `${backendUrl}/api/v1/profile/:path*` },
      { source: "/api/v1/monitors", destination: `${backendUrl}/api/v1/monitors` },
      { source: "/api/v1/monitors/", destination: `${backendUrl}/api/v1/monitors/` },
      { source: "/api/v1/monitors/:path*", destination: `${backendUrl}/api/v1/monitors/:path*` },
    ];
  },
};

export default nextConfig;
