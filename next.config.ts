import type { NextConfig } from "next";

/** Tesseract .wasm — required for Telegram server OCR on Vercel. */
const tesseractTraceIncludes = [
  "./node_modules/tesseract.js-core/*.wasm",
  "./node_modules/tesseract.js-core/*.js",
  "./node_modules/tesseract.js/src/worker-script/**/*.js",
  "./node_modules/tesseract.js/src/worker/**/*.js",
  "./node_modules/tesseract.js/dist/**/*.js",
  "./node_modules/wasm-feature-detect/**/*.cjs",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
        permanent: false,
      },
    ];
  },
  serverExternalPackages: ["tesseract.js", "tesseract.js-core", "sharp"],
  outputFileTracingIncludes: {
    "/api/telegram/webhook": tesseractTraceIncludes,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
