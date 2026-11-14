/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.17"],
  skipTrailingSlashRedirect: true,
  async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "https://159.65.146.87/api/:path*",
    },
    {
      source: "/media/:path*",
      destination: "https://159.65.146.87/media/:path*",
    },
  ];
},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '159.65.146.87',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
