#!/usr/bin/env node
/* Single source of truth for the es-tutorial-video host bundles. Plugin hosts (Claude Code, Codex, Factory, the
 * cross-agent registry) read ./skills/ straight from the repo, so they need no copy. Hosts that take a skill folder
 * (~/.claude/skills, ~/.codex/skills, ~/.gemini/skills, ~/.agents/skills) get a generated bundle:
 *   <dest>/es-tutorial-video/        a copy of skills/es-tutorial-video/
 *   <dest>/es-tutorial-video/kit/    a copy of promo/_tutorial-kit/ (the skill scripts find it there first)
 * Never edit a bundle by hand; re-run this script, and CI runs --check against a fresh bundle.
 *   node scripts/sync-tutorial-skill-hosts.mjs --host claude|codex|gemini|agents      write to the host's default skills dir
 *   node scripts/sync-tutorial-skill-hosts.mjs --dest <skills-dir>                    write to any skills dir
 *   node scripts/sync-tutorial-skill-hosts.mjs --check --host <h> | --dest <dir>      exit 1 and list drift when the bundle differs */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SKILL = 'es-tutorial-video';
export const HOST_DIRS = { claude: '.claude/skills', codex: '.codex/skills', gemini: '.gemini/skills', agents: '.agents/skills' };
const SOURCES = [[path.join(ROOT, 'skills', SKILL), ''], [path.join(ROOT, 'promo', '_tutorial-kit'), 'kit']];
const IGNORED = new Set(['.DS_Store', 'node_modules']);

const walk = (d, base = d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (IGNORED.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p));
  }
  return out.sort();
};

/** The bundle as {relative path -> source file}: skill files + kit files under kit/. */
export function bundleFiles() {
  const map = new Map();
  for (const [src, prefix] of SOURCES) for (const f of walk(src)) map.set(path.join(prefix, f), path.join(src, f));
  return map;
}

export function writeBundle(destSkillsDir) {
  const target = path.join(destSkillsDir, SKILL);
  fs.rmSync(target, { recursive: true, force: true });
  for (const [rel, src] of bundleFiles()) {
    const out = path.join(target, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(src, out);
  }
  return target;
}

/** Drift lines ("missing|changed|extra: <file>") between the source and a bundle; empty = identical. */
export function bundleDrift(destSkillsDir) {
  const target = path.join(destSkillsDir, SKILL);
  const want = bundleFiles(), have = fs.existsSync(target) ? walk(target) : [];
  const out = [];
  for (const [rel, src] of want) {
    const p = path.join(target, rel);
    if (!fs.existsSync(p)) out.push(`missing: ${rel}`);
    else if (!fs.readFileSync(p).equals(fs.readFileSync(src))) out.push(`changed: ${rel}`);
  }
  for (const rel of have) if (!want.has(rel)) out.push(`extra: ${rel}`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const val = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  const host = val('--host'), dest = val('--dest');
  if (host && !HOST_DIRS[host]) { console.error(`unknown host "${host}"; use ${Object.keys(HOST_DIRS).join(' | ')}`); process.exit(2); }
  const skillsDir = dest ? path.resolve(dest) : host ? path.join(os.homedir(), HOST_DIRS[host]) : null;
  if (!skillsDir) { console.error('give --host <claude|codex|gemini|agents> or --dest <skills-dir>'); process.exit(2); }
  if (args.includes('--check')) {
    const drift = bundleDrift(skillsDir);
    drift.forEach((l) => console.log(l));
    if (drift.length) { console.error(`bundle drift in ${path.join(skillsDir, SKILL)}: re-run without --check`); process.exit(1); }
    console.log(`bundle ok: ${path.join(skillsDir, SKILL)}`);
  } else console.log(`wrote ${writeBundle(skillsDir)}`);
}
