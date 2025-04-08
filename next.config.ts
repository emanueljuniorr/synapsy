import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Configuração para resolver problemas com arquivos JSON nas dependências
  webpack: (config) => {
    // Resolver problemas com arquivos JSON no react-syntax-highlighter
    config.module.rules.push({
      test: /\.json$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });
    
    return config;
  },
};

export default nextConfig;
