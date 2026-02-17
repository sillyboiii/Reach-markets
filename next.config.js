/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com', 'yt3.ggpht.com', 'unavatar.io', 'api.dicebear.com'],
  },
}

module.exports = nextConfig
