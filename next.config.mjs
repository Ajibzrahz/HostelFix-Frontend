/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "");

    if (!backend) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL is missing.");
    }

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
