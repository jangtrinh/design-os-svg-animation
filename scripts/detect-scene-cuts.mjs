#!/usr/bin/env node
/**
 * detect-scene-cuts.mjs
 * 
 * Analyzes reference videos using FFmpeg scene detection heuristics.
 * Automatically identifies shot cuts, calculates temporal sections,
 * and generates visual 2-column contact sheets for storyboarding.
 * 
 * Usage:
 *   node scripts/detect-scene-cuts.mjs <input-video.mp4> [output-dir]
 */

import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

function runFFmpeg(args, collectStderr = false) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-hide_banner', ...args]);
    let log = '';
    if (collectStderr) {
      child.stderr.on('data', (chunk) => {
        log += chunk;
      });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(log);
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

async function probeDuration(file) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file
    ]);
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(parseFloat(out.trim()) || 0);
      else reject(new Error(`ffprobe exited with code ${code}`));
    });
  });
}

export async function detectCuts(file, threshold = 0.18) {
  const log = await runFFmpeg([
    '-i', file,
    '-an',
    '-vf', `scale=320:-2,select='gt(scene,${threshold})',showinfo`,
    '-f', 'null',
    '-'
  ], true);

  const cuts = [...log.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
  return cuts.map((c) => Math.round(c * 100) / 100);
}

export function planSections(duration, cuts) {
  const count = Math.max(2, Math.min(10, Math.round(duration / 4.5)));
  const bounds = [0];

  for (let i = 1; i < count; i++) {
    const ideal = (duration * i) / count;
    const previous = bounds.at(-1);
    const near = cuts.filter(
      (c) => c > previous + 1.0 && c < duration - 1.0 && Math.abs(c - ideal) < (duration / count) * 0.45
    );
    near.sort((a, b) => Math.abs(a - ideal) - Math.abs(b - ideal));
    bounds.push(+(near[0] ?? ideal).toFixed(2));
  }

  return bounds.map((start, i) => ({
    section: i + 1,
    start,
    end: +(bounds[i + 1] ?? duration).toFixed(2),
    duration: +((bounds[i + 1] ?? duration) - start).toFixed(2)
  }));
}

export async function generateContactSheet(file, sections, outputPath) {
  const times = sections.flatMap(({ start, end }) => [
    +(start + (end - start) * 0.3).toFixed(2),
    +(start + (end - start) * 0.8).toFixed(2)
  ]);

  const select = times.map((t) => `lt(prev_t\\,${t})*gte(t\\,${t})`).join('+');
  await runFFmpeg([
    '-y',
    '-loglevel', 'error',
    '-i', file,
    '-an',
    '-vf', `select='${select}',scale=480:-2,tile=2x${sections.length}:padding=6:color=black`,
    '-frames:v', '1',
    '-vsync', 'vfr',
    outputPath
  ]);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.log('Usage: node scripts/detect-scene-cuts.mjs <input-video.mp4> [output-dir]');
    process.exit(1);
  }

  const inputFile = path.resolve(args[0]);
  const outputDir = path.resolve(args[1] || path.dirname(inputFile));
  await mkdir(outputDir, { recursive: true });

  const baseName = path.basename(inputFile, path.extname(inputFile));
  console.log(`🎬 Analyzing scene cuts for: ${inputFile}`);

  const duration = await probeDuration(inputFile);
  console.log(`   Video duration: ${duration.toFixed(2)}s`);

  const cuts = await detectCuts(inputFile);
  console.log(`   Detected ${cuts.length} scene cuts: ${cuts.join(', ')}s`);

  const sections = planSections(duration, cuts);
  console.log(`   Planned ${sections.length} logical sections:`);
  sections.forEach((s) => {
    console.log(`     Section ${s.section}: ${s.start}s – ${s.end}s (${s.duration}s)`);
  });

  const jsonOut = path.join(outputDir, `${baseName}.cuts.json`);
  await writeFile(jsonOut, JSON.stringify({ duration, cuts, sections }, null, 2), 'utf8');
  console.log(`✅ Cut data written to: ${jsonOut}`);

  const sheetOut = path.join(outputDir, `${baseName}.contact-sheet.jpg`);
  console.log(`📸 Generating contact sheet: ${sheetOut}`);
  try {
    await generateContactSheet(inputFile, sections, sheetOut);
    console.log(`✅ Contact sheet saved: ${sheetOut}`);
  } catch (err) {
    console.warn(`⚠️ Could not generate contact sheet: ${err.message}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('detect-scene-cuts.mjs')) {
  main().catch((err) => {
    console.error('Fatal scene cut error:', err);
    process.exit(1);
  });
}
