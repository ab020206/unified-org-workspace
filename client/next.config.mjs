/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@workspace/shared-types', '@workspace/shared-utils'],
};

export default nextConfig;
