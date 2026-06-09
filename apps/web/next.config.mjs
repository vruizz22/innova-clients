/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@innova/ui',
    '@innova/supabase',
    '@innova/error-catalog',
    '@innova/design-tokens',
  ],
};

export default nextConfig;
