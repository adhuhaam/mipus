export interface ExtractedPermitFields {
  workPermitNumber: string | null;
  passportNumber: string | null;
}

/** Common OCR confusions in alphanumeric IDs. */
function fixOcrChars(value: string): string {
  return value
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/[Il|]/g, "1");
}

function normalizeWorkPermit(raw: string): string {
  const fixed = fixOcrChars(raw);
  return fixed.startsWith("WP") ? fixed : `WP${fixed}`;
}

function extractWorkPermit(flat: string, upper: string): string | null {
  const wpLabel =
    /(?:WORK\s*PERMIT|PERMIT)\s*(?:NO|NUMBER|#|NUM)?\s*[:.\s]*\s*(WP\s*0?\d{4,})/i;
  const wpLabelMatch = flat.match(wpLabel);
  if (wpLabelMatch) {
    return normalizeWorkPermit(fixOcrChars(wpLabelMatch[1]));
  }

  const xxpatWp =
    flat.match(/WP\s*[-:]?\s*(\d{5,})/i) || flat.match(/(WP\d{5,})/i);
  if (xxpatWp) {
    const raw = xxpatWp[1];
    const withPrefix = raw.toUpperCase().startsWith("WP")
      ? raw
      : `WP${raw}`;
    return normalizeWorkPermit(withPrefix);
  }

  const wpMatches = upper.match(/\bWP0?\d{4,}\b/g);
  if (wpMatches?.length) {
    return normalizeWorkPermit(wpMatches[0]);
  }

  return null;
}

function extractPassport(
  flat: string,
  upper: string,
  workPermitNumber: string | null,
): string | null {
  const passLabel =
    /PASSPORT\s*(?:NO|NUMBER|#|NUM)?\s*[:.\s]*\s*([A-Z0-9]{6,12})/i;
  const passLabelMatch = flat.match(passLabel);
  if (passLabelMatch && !passLabelMatch[1].toUpperCase().startsWith("WP")) {
    return fixOcrChars(passLabelMatch[1]);
  }

  const xxpatPass =
    flat.match(
      /(?:passport|pp)\s*(?:no\.?|number|#)?\s*[-:]?\s*([A-Z]\d{6,9})/i,
    ) || flat.match(/\b([A-Z]\d{6,9})\b/);
  if (xxpatPass && !xxpatPass[1].toUpperCase().startsWith("WP")) {
    return fixOcrChars(xxpatPass[1]);
  }

  const candidates =
    upper.match(/\b[A-Z]{1,2}0?\d{6,9}\b/g)?.filter((c) => !c.startsWith("WP")) ??
    [];

  const unique = [...new Set(candidates)];
  if (unique.length === 1) {
    return unique[0];
  }
  if (unique.length > 1) {
    const wpDigits = workPermitNumber?.replace(/^WP/i, "");
    return unique.find((c) => !wpDigits || !c.includes(wpDigits)) ?? unique[0];
  }

  return null;
}

/** Pull work permit + passport numbers from OCR text on permit cards / passports. */
export function extractPermitFields(ocrText: string): ExtractedPermitFields {
  const text = ocrText.replace(/\r/g, "\n");
  const flat = text.replace(/\s+/g, " ").trim();
  const upper = fixOcrChars(flat);

  const workPermitNumber = extractWorkPermit(flat, upper);
  const passportNumber = extractPassport(flat, upper, workPermitNumber);

  return { workPermitNumber, passportNumber };
}
