import sharp from "sharp";

/** Resize & compress document photos for faster, more reliable OCR. */
export async function preprocessOcrImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .normalize()
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}
