/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend = process.env.BACKEND_URL
    return [
      { source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*` },
      { source: '/backend-health', destination: `${backend}/health` },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
