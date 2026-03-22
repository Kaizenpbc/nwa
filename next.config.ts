import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "BOT9jHbv5uSivn92YgGE7jV7g5gh_SD1CGgjTUaCTuiQ7LJnxS5iOFYHvsZx9PkYCEcBrFendcc2dkm4IrF_32o",
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
