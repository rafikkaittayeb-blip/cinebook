import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'media.themoviedb.org' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

export default nextConfig