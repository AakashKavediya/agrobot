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
  // Explicit turbopack config (empty) to avoid conflicts when using a custom webpack() config.
  turbopack: {},
  // Prevent webpack from bundling Node core modules that the `mqtt` package may try to require.
  webpack: (config, { isServer }) => {
    // Only apply in client builds — server can require node modules normally.
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = Object.assign({}, config.resolve.fallback, {
        net: false,
        tls: false,
        fs: false,
        dns: false,
        stream: false,
        path: false,
        os: false,
        crypto: false,
      });
    }
    return config;
  },
};

module.exports = nextConfig;