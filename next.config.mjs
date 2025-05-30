/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@anthropic-ai/sdk'],
  transpilePackages: [],
};

export default nextConfig;
