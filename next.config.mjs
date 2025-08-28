/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next",
  trailingSlash: true,
  images: {
    domains: ["blob.v0.dev"],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_USDT_WALLET: process.env.NEXT_PUBLIC_USDT_WALLET,
  },
};

export default nextConfig;
