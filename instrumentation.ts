/** Pre-load PaddleOCR when the Node server starts (faster first Telegram/PWA scan). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmOcrEngine } = await import("./lib/ocr-scan-server");
    warmOcrEngine();
  }
}
