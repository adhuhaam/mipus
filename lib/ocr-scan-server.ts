import fs from "fs/promises";
import os from "os";
import path from "path";
import { extractPermitFields, type ExtractedPermitFields } from "./ocr-extract";
import { preprocessOcrImage } from "./ocr-preprocess";

type OcrLine = { text: string };

type GutenOcr = {
  detect: (imagePath: string) => Promise<OcrLine[]>;
};

let ocrReady: Promise<GutenOcr> | null = null;

function loadGutenOcr(): Promise<GutenOcr> {
  if (!ocrReady) {
    ocrReady = (async () => {
      const mod = await import("@gutenye/ocr-node");
      const Ocr = mod.default;
      return Ocr.create() as Promise<GutenOcr>;
    })();
  }
  return ocrReady;
}

function linesToText(lines: OcrLine[]): string {
  const joined = lines.map((l) => l.text.trim()).filter(Boolean);
  return `${joined.join("\n")}\n${joined.join(" ")}`;
}

/**
 * Server OCR: PaddleOCR (PP-OCRv4) via @gutenye/ocr-node — MIT, faster than
 * cold-starting Tesseract on each request when the engine stays warm.
 */
export async function scanBufferForPermitFieldsServer(
  image: Buffer,
): Promise<ExtractedPermitFields> {
  const processed = await preprocessOcrImage(image);
  const tmpPath = path.join(
    os.tmpdir(),
    `xpat-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
  );

  await fs.writeFile(tmpPath, processed);

  try {
    const ocr = await loadGutenOcr();
    const lines = await ocr.detect(tmpPath);
    return extractPermitFields(linesToText(lines));
  } finally {
    await fs.unlink(tmpPath).catch(() => undefined);
  }
}

/** Pre-load models on first deploy request (optional warm-up). */
export function warmOcrEngine(): void {
  void loadGutenOcr().catch((err) => {
    console.error("OCR warm-up failed", err);
  });
}
