import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
};

export default nextConfig;

import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
  initOpenNextCloudflareForDev();
});
