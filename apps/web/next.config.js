/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Support for canvas and node modules
  webpack: (config, { isServer }) => {
    // Handle canvas module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Handle node modules that need special treatment
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('canvas', 'argon2');
    }

    return config;
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Transpile packages that need it
  transpilePackages: [
    '@chakra-ui/react',
    '@emotion/react',
    '@emotion/styled',
    'framer-motion',
    'motion',
  ],

  // Environment variables
  env: {
    // Add any custom env vars here
  },
};

export default nextConfig;
