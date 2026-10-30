import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/planet-jumping.html", destination: "/", permanent: false }];
  },
};

export default config;
