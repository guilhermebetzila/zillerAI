/** @type {import('next').NextConfig} */
const nextConfig = {
  // Diretório padrão de build
  distDir: '.next',

  // Adiciona barra no final das rotas
  trailingSlash: true,

  // Configuração de imagens externas
  images: {
    domains: ['blob.v0.dev'],
  },

  // Variáveis de ambiente expostas ao frontend
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_USDT_WALLET: process.env.NEXT_PUBLIC_USDT_WALLET,
  },
};

export default nextConfig;
