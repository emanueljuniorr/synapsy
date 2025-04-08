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
  webpack: (config, { isServer }) => {
    // Resolver problemas com arquivos JSON em todas as dependências
    config.module.rules.unshift({
      test: /\.json$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });

    // Regra específica para o grpc-js
    config.module.rules.push({
      test: /node_modules\/@grpc\/grpc-js\/.*\.json$/,
      use: 'json-loader',
      type: 'javascript/auto',
    });

    // Ignorar problemas com o grpc no lado do cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "net": false,
        "tls": false,
        "dns": false
      };
    }
    
    return config;
  },
  // Transpilação de dependências que precisam de suporte ao ESM
  transpilePackages: ['@grpc/grpc-js', '@firebase/firestore']
};

module.exports = nextConfig; 