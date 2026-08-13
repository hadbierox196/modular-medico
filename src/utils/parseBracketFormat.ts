import type { AdminQuestion, ImportResult } from "../types";

/**
 * Parses blocks of the form:
 *   [Question text ; Option A | Option B | *Option C | Option D]
 * where the option prefixed with "*" is the correct answer.
 */
export function parseBracketFormat(raw: string, existing: AdminQuestion[]): ImportResult[] {
  const blocks = raw.match(/\[[^\]]*\]/g) || [];
  const existingNorm = new Set(existing.map((q) => q.q.trim().toLowerCase()));

  return blocks.map((block, i) => {
    const inner = block.slice(1, -1);
    const semiIdx = inner.indexOf(";");
    if (semiIdx === -1) {
      return { line: i + 1, raw: block, status: "error", message: "Missing ';' separating question from options." };
    }

    const qText = inner.slice(0, semiIdx).trim();
    const optsPart = inner.slice(semiIdx + 1);
    const rawOpts = optsPart.split("|").map((o) => o.trim());

    if (rawOpts.length !== 4) {
      return { line: i + 1, raw: block, status: "error", message: `Expected exactly 4 options separated by '|', found ${rawOpts.length}.` };
    }

    const starCount = rawOpts.filter((o) => o.startsWith("*")).length;
    if (starCount === 0) return { line: i + 1, raw: block, status: "error", message: "No correct option marked with '*'." };
    if (starCount > 1) return { line: i + 1, raw: block, status: "error", message: "More than one option marked with '*'." };
    if (!qText) return { line: i + 1, raw: block, status: "error", message: "Question text is empty." };

    const correctIdx = rawOpts.findIndex((o) => o.startsWith("*"));
    const options = rawOpts.map((o) => (o.startsWith("*") ? o.slice(1).trim() : o));
    const duplicate = existingNorm.has(qText.toLowerCase());

    return {
      line: i + 1,
      raw: block,
      status: duplicate ? "warning" : "valid",
      message: duplicate ? "Possible duplicate of an existing question." : "Valid entry.",
      q: qText,
      options,
      correct: correctIdx,
    };
  });
}
