import sharp from "sharp";

/** Light server preprocess (rotate + resize only — matches xxpat “full image” intent). */
export async function preprocessOcrImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}
