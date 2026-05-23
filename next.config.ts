import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "playwright-core", "@sparticuz/chromium"],
  // Vercel file tracing omits @sparticuz/chromium/bin (brotli archives) unless listed explicitly.
  outputFileTracingIncludes: {
    "/api/export-pdf": ["./node_modules/@sparticuz/chromium/**"],
    "app/api/export-pdf/route": ["./node_modules/@sparticuz/chromium/**"],
  },
};

export default nextConfig;
