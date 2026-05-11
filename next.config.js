/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;