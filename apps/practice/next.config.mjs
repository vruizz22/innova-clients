/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx'],
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        externalDir: true
    }
};

export default nextConfig;
