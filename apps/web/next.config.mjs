/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('firebase-admin', 'jwks-rsa', 'jose');
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
