import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export const name = "standalone-chat";
export const inject = [];

export function apply(ctx) {
  const scratchpadDir = join(homedir(), ".dsh", "scratchpad");
  try {
    mkdirSync(scratchpadDir, { recursive: true });
  } catch (err) {
    console.warn("[standalone-chat] failed to create scratchpad dir:", err);
  }
}

