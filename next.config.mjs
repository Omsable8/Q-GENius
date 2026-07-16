/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api_flask/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? '/backend/api_handler.py' // Directly targets your Flask script on Vercel
          : 'http://127.0.0*', // Targets your local Flask port during development
      },
    ];
  },
};

export default nextConfig;
