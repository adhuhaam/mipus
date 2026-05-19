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

/** Pull work permit + passport numbers from OCR text on permit cards / passports. */
export function extractPermitFields(ocrText: string): ExtractedPermitFields {
  const text = ocrText.replace(/\r/g, "\n");
  const flat = text.replace(/\s+/g, " ").trim();
  const upper = fixOcrChars(flat);

  let workPermitNumber: string | null = null;

  const wpLabel =
    /(?:WORK\s*PERMIT|PERMIT)\s*(?:NO|NUMBER|#|NUM)?\s*[:.\s]*\s*(WP\s*0?\d{4,})/i;
  const wpLabelMatch = flat.match(wpLabel);
  if (wpLabelMatch) {
    workPermitNumber = normalizeWorkPermit(fixOcrChars(wpLabelMatch[1]));
  }

  if (!workPermitNumber) {
    const wpMatches = upper.match(/\bWP0?\d{4,}\b/g);
    if (wpMatches?.length) {
      workPermitNumber = normalizeWorkPermit(wpMatches[0]);
    }
  }

  let passportNumber: string | null = null;

  const passLabel =
    /PASSPORT\s*(?:NO|NUMBER|#|NUM)?\s*[:.\s]*\s*([A-Z0-9]{6,12})/i;
  const passLabelMatch = flat.match(passLabel);
  if (passLabelMatch && !passLabelMatch[1].toUpperCase().startsWith("WP")) {
    passportNumber = fixOcrChars(passLabelMatch[1]);
  }

  if (!passportNumber) {
    const candidates =
      upper.match(/\b[A-Z]{1,2}0?\d{6,9}\b/g)?.filter((c) => !c.startsWith("WP")) ??
      [];

    const unique = [...new Set(candidates)];
    if (unique.length === 1) {
      passportNumber = unique[0];
    } else if (unique.length > 1) {
      const wpDigits = workPermitNumber?.replace(/^WP/i, "");
      passportNumber =
        unique.find((c) => !wpDigits || !c.includes(wpDigits)) ?? unique[0];
    }
  }

  return { workPermitNumber, passportNumber };
}

function normalizeWorkPermit(raw: string): string {
  const fixed = fixOcrChars(raw);
  return fixed.startsWith("WP") ? fixed : `WP${fixed}`;
}
