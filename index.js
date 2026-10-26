import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const name = 'standalone-chat';
export const inject = ['workspaceRegistry'];

export async function apply(ctx) {
  const scratchpadDir = join(homedir(), '.dsh', 'scratchpad');
  try {
    mkdirSync(scratchpadDir, { recursive: true });
    // Harness needs real workspace membership to enable a new-session composer.
    // Resolve first so plugin reloads reuse sessions and user-customized titles.
    const existing = await ctx.workspaceRegistry.resolveByPath(scratchpadDir);
    if (!existing) await ctx.workspaceRegistry.create(scratchpadDir);
  } catch (error) {
    console.warn('[standalone-chat] failed to prepare scratchpad workspace:', error);
  }
}
