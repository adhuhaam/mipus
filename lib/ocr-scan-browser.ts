import { extractPermitFields, type ExtractedPermitFields } from "./ocr-extract";

export type OcrProgress = {
  status: string;
  progress: number;
};

type TesseractWorker = {
  recognize: (
    image: File | Blob | Buffer,
  ) => Promise<{ data: { text: string } }>;
  setParameters: (params: Record<string, string>) => Promise<unknown>;
};

let workerPromise: Promise<TesseractWorker> | null = null;

async function getBrowserWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: () => {},
      });
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
      });
      return worker;
    })();
  }
  return workerPromise;
}

async function resizeImageFile(file: File, maxWidth = 1600): Promise<Blob> {
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
      0.9,
    );
  });
}

/** Browser OCR: Tesseract with a reused worker + downscaled image. */
export async function scanDocumentForPermitFields(
  file: File,
  onProgress?: (p: OcrProgress) => void,
): Promise<ExtractedPermitFields> {
  onProgress?.({ status: "Preparing image…", progress: 10 });
  const resized = await resizeImageFile(file);

  onProgress?.({ status: "Reading document…", progress: 30 });
  const worker = await getBrowserWorker();
  const {
    data: { text },
  } = await worker.recognize(resized);

  onProgress?.({ status: "Done", progress: 100 });
  return extractPermitFields(text);
}
