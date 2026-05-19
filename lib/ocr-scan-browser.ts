import { extractPermitFields, type ExtractedPermitFields } from "./ocr-extract";

export type OcrProgress = {
  status: string;
  progress: number;
};

async function resizeImageFile(file: File, maxWidth = 1600): Promise<File | Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("resize failed"))),
      "image/jpeg",
      0.92,
    );
  });
}

/**
 * Browser OCR (xxpat-style): Tesseract v7 in the client — no Vercel server round-trip.
 */
export async function scanDocumentForPermitFields(
  file: File,
  onProgress?: (p: OcrProgress) => void,
): Promise<ExtractedPermitFields> {
  onProgress?.({ status: "Preparing image…", progress: 10 });

  const input = await resizeImageFile(file);

  onProgress?.({ status: "Loading OCR…", progress: 20 });

  const Tesseract = await import("tesseract.js");

  onProgress?.({ status: "Reading document…", progress: 30 });

  const result = await Tesseract.recognize(input, "eng", {
    logger: (message) => {
      if (message.status === "recognizing text" && message.progress) {
        onProgress?.({
          status: "Reading document…",
          progress: 30 + Math.round(message.progress * 65),
        });
      }
    },
  });

  onProgress?.({ status: "Done", progress: 100 });
  return extractPermitFields(result.data.text);
}
