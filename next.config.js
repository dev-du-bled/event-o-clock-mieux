/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // profle picture seed
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

module.exports = nextConfig;
