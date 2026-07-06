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
  }
};

export default nextConfig;
