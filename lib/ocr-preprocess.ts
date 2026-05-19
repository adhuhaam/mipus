import sharp from "sharp";

/** Resize & enhance document photos for Tesseract OCR. */
export async function preprocessOcrImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}
