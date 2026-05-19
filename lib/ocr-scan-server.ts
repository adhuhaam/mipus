import { createWorker, OEM, PSM } from "tesseract.js";
import { extractPermitFields, type ExtractedPermitFields } from "./ocr-extract";
import { preprocessOcrImage } from "./ocr-preprocess";

/** Fast English models (downloaded once into /tmp on Vercel). */
const TESSDATA_BASE = "https://tessdata.projectnaptha.com/4.0.0_fast";

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;

let workerReady: Promise<OcrWorker> | null = null;

function createOcrWorker(): Promise<OcrWorker> {
  return (async () => {
    const worker = await createWorker("eng", OEM.LSTM_ONLY, {
      cachePath: "/tmp",
      langPath: TESSDATA_BASE,
      gzip: true,
      logger: () => {},
    });
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });
    return worker;
  })();
}

function getOcrWorker(): Promise<OcrWorker> {
  if (!workerReady) {
    workerReady = createOcrWorker().catch((err) => {
      workerReady = null;
      throw err;
    });
  }
  return workerReady;
}

/**
 * Server OCR via Tesseract.js (Apache-2.0) — fits Vercel serverless unlike Paddle/ONNX.
 */
export async function scanBufferForPermitFieldsServer(
  image: Buffer,
): Promise<ExtractedPermitFields> {
  const processed = await preprocessOcrImage(image);
  const worker = await getOcrWorker();
  const {
    data: { text },
  } = await worker.recognize(processed);
  return extractPermitFields(text);
}

/** Optional: start language download before first user scan. */
export function warmOcrEngine(): void {
  void getOcrWorker().catch((err) => {
    console.error("Tesseract warm-up failed", err);
  });
}
