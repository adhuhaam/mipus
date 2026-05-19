import sharp from "sharp";

/** Resize & compress document photos for faster, more reliable OCR. */
export async function preprocessOcrImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({
      width: 1280,
      height: 1280,
      fit: "inside",
      withoutEnlargement: true,
    })
    .normalize()
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}
