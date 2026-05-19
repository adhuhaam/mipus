export type ParsedPermitInput =
  | { ok: true; workPermitNumber: string; passportNumber: string }
  | { ok: false; error: string };

const HELP_TEXT = `<b>Instructions</b>

Send your Work Permit Number and Passport Number in the format below, or send a photo of any document containing both numbers. I will provide your visa information, current status, work permit details, and other available information.

নিচের ফরম্যাটে আপনার ওয়ার্ক পারমিট নম্বর এবং পাসপোর্ট নম্বর পাঠান, অথবা এমন কোনো ডকুমেন্টের ছবি পাঠান যেখানে এই দুটি নম্বর রয়েছে। আমি আপনাকে ভিসার তথ্য, বর্তমান স্ট্যাটাস, ওয়ার্ক পারমিটের তথ্য এবং অন্যান্য উপলব্ধ তথ্য পাঠিয়ে দেব।

<code>WP00000000</code>
<code>A0000000</code>`;

export function getBotHelpText(): string {
  return HELP_TEXT;
}

/** Parse two-line message: work permit then passport. */
export function parsePermitMessage(text: string): ParsedPermitInput {
  const trimmed = text.trim();

  if (trimmed.startsWith("/")) {
    return { ok: false, error: HELP_TEXT };
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      ok: false,
      error:
        "Send two lines (permit then passport), or send a <b>photo</b> of a document with both numbers.\n\nExample:\n<code>WP00000000</code>\n<code>A0000000</code>",
    };
  }

  const workPermitNumber = lines[0].replace(/\s/g, "").toUpperCase();
  const passportNumber = lines[1].replace(/\s/g, "").toUpperCase();

  if (!/^WP[\dA-Z]+$/i.test(workPermitNumber)) {
    return {
      ok: false,
      error:
        "Work permit should start with WP (example: WP00595305). Check line 1.",
    };
  }

  if (passportNumber.length < 5) {
    return {
      ok: false,
      error: "Passport number looks too short. Check line 2.",
    };
  }

  return { ok: true, workPermitNumber, passportNumber };
}

export function formatOcrFailureMessage(
  partial?: { workPermitNumber?: string; passportNumber?: string },
): string {
  const found: string[] = [];
  if (partial?.workPermitNumber) found.push(`Permit: <code>${partial.workPermitNumber}</code>`);
  if (partial?.passportNumber) found.push(`Passport: <code>${partial.passportNumber}</code>`);

  let msg =
    "❌ <b>Could not read both numbers</b> from the image.\n\nUse a clear, well-lit photo where <b>work permit (WP…)</b> and <b>passport</b> are visible.";

  if (found.length) {
    msg += `\n\nFound only:\n${found.join("\n")}\n\nSend the missing number as text, or try another photo.`;
  } else {
    msg += "\n\nOr send two lines of text instead.";
  }

  return msg;
}
