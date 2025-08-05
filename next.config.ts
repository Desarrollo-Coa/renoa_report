import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/cloud-centralbq-ops-storage/**',
      },
      {
        protocol: 'https',
        hostname: 'nyc3.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/cloud-centralbq-ops-storage/**',
      },
      {
        protocol: 'https',
        hostname: 'nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/cloud-centralctg-ops-storage/**',
      },
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;