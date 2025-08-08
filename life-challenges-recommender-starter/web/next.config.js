/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // Using Pages Router
  },
  env: {
    NEXT_PUBLIC_ROADMAP_CSV_URL: process.env.NEXT_PUBLIC_ROADMAP_CSV_URL,
    NEXT_PUBLIC_BOOKS_CSV_URL: process.env.NEXT_PUBLIC_BOOKS_CSV_URL,
  },
  // CORS設定（開発時用）
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig