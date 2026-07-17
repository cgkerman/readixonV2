/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  experimental: {
    serverComponentsExternalPackages: ['nodemailer']
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
