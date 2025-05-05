/** @type {import('next').NextConfig} */
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const nextConfig = {
  // Ignorar erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorar erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Configuração para build de produção standalone
  output: 'standalone',
  // Pacotes externos para componentes de servidor
  serverExternalPackages: ['firebase-admin'],
  // Configuração para resolver problemas com arquivos JSON nas dependências
  webpack: (config, { isServer }) => {
    // Adicionar polyfills para módulos Node.js nativos
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin());
      
      // Resolver módulos node: no client side
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:process': 'process',
        'node:stream': 'stream-browserify',
        'node:util': 'util',
        'node:buffer': 'buffer',
        'node:url': 'url',
        'node:http': 'http-browserify',
        'node:path': 'path-browserify',
        'node:crypto': 'crypto-browserify',
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
      };
    }
    
    // Desativar o parser de JSON padrão para todos os arquivos JSON
    // e usar um parser personalizado que é mais tolerante
    config.module.rules.forEach((rule) => {
      if (rule.type === 'json') {
        rule.type = undefined;
      }
    });
    
    // Adicionar um loader específico para arquivos JSON
    config.module.rules.unshift({
      test: /\.json$/,
      loader: 'json5-loader',
      type: 'javascript/auto',
      options: {
        esModule: false,
      },
    });

    // Regra específica para o character-entities direto
    config.module.rules.push({
      test: /node_modules\/character-entities\/index\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra específica para character-entities-legacy direto
    config.module.rules.push({
      test: /node_modules\/character-entities-legacy\/index\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra específica para character-reference-invalid direto
    config.module.rules.push({
      test: /node_modules\/character-reference-invalid\/index\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra específica para o grpc-js package.json
    config.module.rules.push({
      test: /node_modules\/@grpc\/grpc-js\/package\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: JSON.stringify({
            name: "@grpc/grpc-js",
            version: "1.9.15",
            main: "build/src/index.js",
            types: "build/src/index.d.ts"
          }),
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra específica para character-entities em react-syntax-highlighter
    config.module.rules.push({
      test: /node_modules\/react-syntax-highlighter\/node_modules\/character-entities\/index\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra geral para o grpc-js
    config.module.rules.push({
      test: /node_modules\/@grpc\/grpc-js\/.*\.json$/,
      exclude: /node_modules\/@grpc\/grpc-js\/package\.json$/,
      use: 'json-loader',
      type: 'javascript/auto',
    });

    // Regra mais específica para character-entities-legacy em react-syntax-highlighter
    config.module.rules.push({
      test: /node_modules\/react-syntax-highlighter\/node_modules\/character-entities-legacy\/index\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra mais específica para character-entities-legacy geral
    config.module.rules.push({
      test: /node_modules\/.*character-entities-legacy\/index\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Regra para arquivos de entidades HTML (character-entities-*)
    config.module.rules.push({
      test: /node_modules\/character-entities.*\/.*\.json$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /^.+$/s,
          replace: '{}',
          flags: 'g'
        }
      },
      type: 'javascript/auto',
    });

    // Ignorar problemas com o grpc no lado do cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "net": false,
        "tls": false,
        "dns": false,
        "path": false,
        "url": false,
        "stream": false,
        "http": false,
        "https": false,
        "zlib": false,
        "util": false
      };
    }
    
    return config;
  },
  // Transpilação de dependências que precisam de suporte ao ESM
  transpilePackages: [
    '@grpc/grpc-js', 
    '@firebase/firestore', 
    'character-entities',
    'character-entities-legacy', 
    'character-reference-invalid',
    'remark',
    'unified',
    'unist',
    'mdast',
    'react-syntax-highlighter',
    'refractor',
    'parse-entities',
    'hast-util-parse-selector'
  ]
};

module.exports = nextConfig;