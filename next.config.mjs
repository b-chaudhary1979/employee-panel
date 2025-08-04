/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        buffer: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        events: false,
        punycode: false,
        string_decoder: false,
        tty: false,
        domain: false,
        constants: false,
        vm: false,
        module: false,
        _stream_duplex: false,
        _stream_passthrough: false,
        _stream_readable: false,
        _stream_transform: false,
        _stream_writable: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
