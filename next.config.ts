import type { NextConfig } from "next";

/** Keep Vercel serverless bundles under 250 MB (onnxruntime ships all OSes + CUDA). */
const onnxRuntimeExcludes = [
  "./node_modules/onnxruntime-node/bin/napi-v6/darwin/**",
  "./node_modules/onnxruntime-node/bin/napi-v6/win32/**",
  "./node_modules/onnxruntime-node/bin/napi-v6/linux/arm64/**",
  "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime_providers_cuda.so",
  "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime_providers_tensorrt.so",
];

const ocrStackExcludes = [
  ...onnxRuntimeExcludes,
  "./node_modules/@gutenye/**",
  "./node_modules/@techstark/**",
  "./node_modules/onnxruntime-node/**",
  "./node_modules/onnxruntime-common/**",
  "./node_modules/js-clipper/**",
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
  serverExternalPackages: [
    "@gutenye/ocr-node",
    "@gutenye/ocr-models",
    "onnxruntime-node",
    "sharp",
  ],
  outputFileTracingExcludes: {
    "*": onnxRuntimeExcludes,
    "/api/work-permit": ocrStackExcludes,
    "/api/work-permit/card": ocrStackExcludes,
    "/api/work-permit/photo": ocrStackExcludes,
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
