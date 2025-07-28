/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'archivos-grupo-argos.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloud-centralctg-ops-storage.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },

    ],
  },
};

export default nextConfig;