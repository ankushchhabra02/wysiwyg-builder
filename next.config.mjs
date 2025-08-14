/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // for Turbopack, Tailwind works better with this off
  },
};
export default nextConfig;
