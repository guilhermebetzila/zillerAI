/** @type {import('next').NextConfig} */
const nextConfig = {
  // Diretório de build
  distDir: '.next',

  // Forçar barra no final das URLs
  trailingSlash: true,

  // Domínios permitidos para <Image />
  images: {
    domains: ['blob.v0.dev'],
  },

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_USDT_WALLET: process.env.NEXT_PUBLIC_USDT_WALLET,
  },
};

// Exportar configuração usando CommonJS
module.exports = nextConfig;
