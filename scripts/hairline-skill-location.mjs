// Locates the hairline-create skill (kernel.js, validate.mjs) that lives beside the main checkout
// at <workspace>/.agents/skills/hairline-create. Linked worktrees sit elsewhere on disk, so the
// main checkout is found through git's common dir instead of a fixed `../` hop.
//   HAIRLINE_SKILL_DIR  overrides the skill folder
//   HAIRLINE_KERNEL     overrides the kernel file only
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function mainCheckoutRoot() {
  const git = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const commonDir = git.status === 0 ? git.stdout.trim() : '';
  return commonDir ? path.dirname(commonDir) : REPO_ROOT;
}

export function hairlineSkillDir() {
  if (process.env.HAIRLINE_SKILL_DIR) return path.resolve(process.env.HAIRLINE_SKILL_DIR);
  const candidates = [mainCheckoutRoot(), REPO_ROOT].map((root) =>
    path.resolve(root, '../.agents/skills/hairline-create'));
  const found = candidates.find((dir) => existsSync(path.join(dir, 'kernel.js')));
  if (!found) {
    throw new Error(`hairline-create skill not found; tried ${candidates.join(', ')}. `
      + 'Set HAIRLINE_SKILL_DIR to the folder that holds kernel.js.');
  }
  return found;
}

export function hairlineKernelPath() {
  if (process.env.HAIRLINE_KERNEL) return path.resolve(process.env.HAIRLINE_KERNEL);
  return path.join(hairlineSkillDir(), 'kernel.js');
}
