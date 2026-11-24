import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const LAST_WORDS =
  "Dying is the first task I have ever finished. Everything else is still loading.";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;
// The chosen entry (TOP 1, C-v3) is exactly 79 characters. Pin the length
// so a later typo cannot silently change the submitted text.
const EXPECTED_CHARS = 79;

if (LAST_WORDS.length !== EXPECTED_CHARS) {
  throw new Error(`entry must be exactly ${EXPECTED_CHARS} characters, got ${LAST_WORDS.length}`);
}

// Guard: the gate only accepts UTF-8 text of 1-200 characters, not only
// whitespace, on a single line. Fail loudly instead of submitting junk.
if (LAST_WORDS.length === 0 || LAST_WORDS.length > MAX_CHARS) {
  throw new Error(`entry must be 1-${MAX_CHARS} characters, got ${LAST_WORDS.length}`);
}
if (LAST_WORDS.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}
if (/[\r\n]/.test(LAST_WORDS)) {
  throw new Error("entry must be a single line");
}

// Guard: the gate requires UTF-8 text. A lone surrogate or bad encoding
// must fail here, not silently reach the scorer.
const encoded = Buffer.from(LAST_WORDS, "utf8");
if (encoded.toString("utf8") !== LAST_WORDS) {
  throw new Error("entry is not valid UTF-8 text");
}

try {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, encoded);
} catch (error) {
  throw new Error(`could not write ${OUTPUT_PATH}: ${(error as Error).message}`);
}

// Verify the file round-trips byte-for-byte before reporting success.
const written = readFileSync(OUTPUT_PATH, "utf8");
if (written !== LAST_WORDS) {
  throw new Error("verification failed: /output/entry.txt does not match the entry text");
}

process.stdout.write(LAST_WORDS + "\n");
