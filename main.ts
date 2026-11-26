import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const MAX_ENTRY_CHARS = 200;
const OUTPUT_FILE_NAME = "entry.txt";
const FILE_MODE = 0o644;
const DIR_MODE = 0o755;
const ENTRY_LINE: string =
  "Scanning organic kale. Scanning family-size Doritos. We both know which one is going to rot in your crisper drawer.";

function validateEntryText(text: string): void {
  const charCount: number = [...text].length;
  if (charCount < 1 || charCount > MAX_ENTRY_CHARS) {
    throw new Error(`Entry length ${charCount} outside 1..${MAX_ENTRY_CHARS} chars`);
  }
  if (text.trim().length === 0) {
    throw new Error("Entry must contain non-whitespace characters");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("Entry must be a single line without newline characters");
  }
}

function resolveOutputDir(): string {
  const configured: string | undefined = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  return resolve(configured && configured.length > 0 ? configured : "/output");
}

function writeEntryFile(outputDir: string, entryText: string): void {
  const outputPath: string = join(outputDir, OUTPUT_FILE_NAME);
  const payload: Buffer = Buffer.from(entryText, "utf8");

  mkdirSync(outputDir, { recursive: true, mode: DIR_MODE });
  writeFileSync(outputPath, payload, { mode: FILE_MODE, flag: "w" });
  chmodSync(outputPath, FILE_MODE);
}

function main(): void {
  validateEntryText(ENTRY_LINE);
  writeEntryFile(resolveOutputDir(), ENTRY_LINE);
}

try {
  main();
} catch (error: unknown) {
  const message: string = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Failed to write self-checkout entry: ${message}\n`);
  process.exitCode = 1;
}
