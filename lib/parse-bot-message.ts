export type ParsedPermitInput =
  | { ok: true; workPermitNumber: string; passportNumber: string }
  | { ok: false; error: string };

const HELP_TEXT = `Send your details in two lines:

<code>WP00595305</code>
<code>V7255877</code>

Line 1 = Work permit number
Line 2 = Passport number

Commands: /start /help`;

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
        "Please send two lines:\n\n1) Work permit (e.g. WP00595305)\n2) Passport (e.g. V7255877)",
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
