import { extractPermitFields, type ExtractedPermitFields } from "./ocr-extract";

export type OcrProgress = {
  status: string;
  progress: number;
};

/** Run Tesseract OCR on image bytes (Node / server). */
export async function scanBufferForPermitFields(
  image: Buffer | Uint8Array,
  onProgress?: (p: OcrProgress) => void,
): Promise<ExtractedPermitFields> {
  const buffer = Buffer.isBuffer(image) ? image : Buffer.from(image);
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.({
          status: "Reading document…",
          progress: Math.round(m.progress * 100),
        });
      } else if (m.status) {
        onProgress?.({ status: "Preparing scan…", progress: 0 });
      }
    },
  });

  try {
    onProgress?.({ status: "Scanning document…", progress: 0 });
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return extractPermitFields(text);
  } finally {
    await worker.terminate();
  }
}

/** Run Tesseract OCR on an image file (browser). */
export async function scanDocumentForPermitFields(
  file: File,
  onProgress?: (p: OcrProgress) => void,
): Promise<ExtractedPermitFields> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return scanBufferForPermitFields(buffer, onProgress);
}
