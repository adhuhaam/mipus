import type { NextConfig } from "next";

/** Tesseract .wasm files are not picked up by default file tracing on Vercel. */
const tesseractTraceIncludes = [
  "./node_modules/tesseract.js-core/*.wasm",
  "./node_modules/tesseract.js-core/*.js",
  "./node_modules/tesseract.js/src/worker-script/**/*.js",
  "./node_modules/tesseract.js/src/worker/**/*.js",
  "./node_modules/wasm-feature-detect/**/*.cjs",
];

const ocrRoutes = ["/api/ocr", "/api/telegram/webhook"] as const;

const outputFileTracingIncludes = Object.fromEntries(
  ocrRoutes.map((route) => [route, tesseractTraceIncludes]),
);

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
  outputFileTracingIncludes,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
