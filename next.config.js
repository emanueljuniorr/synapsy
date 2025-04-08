/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
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
  }
};

module.exports = nextConfig; 