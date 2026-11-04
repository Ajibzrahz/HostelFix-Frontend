/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Provide a fallback URL to prevent throwing during build time
    const rawBackend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const backend = rawBackend.replace(/\/+$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: "/backend-health",
        destination: `${backend}/health`,
      },
    ];
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;