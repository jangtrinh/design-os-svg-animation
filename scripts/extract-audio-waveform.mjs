#!/usr/bin/env node
/**
 * extract-audio-waveform.mjs
 * 
 * Precomputes a lightweight audio waveform envelope from any video or audio file.
 * Enables scrub timelines and motion players to render real visual audio waveforms
 * with zero browser decoding latency.
 * 
 * Usage:
 *   node scripts/extract-audio-waveform.mjs <input-video-or-audio> [output-json]
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const RATE = 50; // 50 peaks per second
const SAMPLE_RATE = 4000;
const WINDOW = SAMPLE_RATE / RATE;

export function extractEnvelope(filePath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', filePath,
      '-vn',
      '-ac', '1',
      '-ar', String(SAMPLE_RATE),
      '-f', 's16le',
      'pipe:1'
    ]);

    const peaks = [];
    let peak = 0;
    let count = 0;
    let carry = Buffer.alloc(0);

    ffmpeg.stdout.on('data', (chunk) => {
      const data = carry.length ? Buffer.concat([carry, chunk]) : chunk;
      const usable = data.length - (data.length % 2);
      for (let offset = 0; offset < usable; offset += 2) {
        peak = Math.max(peak, Math.abs(data.readInt16LE(offset)));
        if (++count === WINDOW) {
          peaks.push(peak);
          peak = 0;
          count = 0;
        }
      }
      carry = data.subarray(usable);
    });

    ffmpeg.on('error', reject);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve(peaks);
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.log('Usage: node scripts/extract-audio-waveform.mjs <input-video-or-audio> [output-json]');
    process.exit(1);
  }

  const inputFile = path.resolve(args[0]);
  const defaultOutput = inputFile.replace(/\.[^/.]+$/, '') + '.wave.json';
  const outputFile = path.resolve(args[1] || defaultOutput);

  console.log(`🎵 Extracting audio waveform from: ${inputFile}`);
  const rawPeaks = await extractEnvelope(inputFile);
  const max = Math.max(1, ...rawPeaks);
  const normalizedPeaks = rawPeaks.map((p) => Math.round((p / max) * 100));

  const result = {
    rate: RATE,
    sampleCount: normalizedPeaks.length,
    durationSeconds: Math.round((normalizedPeaks.length / RATE) * 100) / 100,
    peaks: normalizedPeaks
  };

  await writeFile(outputFile, JSON.stringify(result, null, 2), 'utf8');
  console.log(`✅ Waveform written to: ${outputFile} (${normalizedPeaks.length} peaks, ${result.durationSeconds}s)`);
}

if (process.argv[1] && process.argv[1].endsWith('extract-audio-waveform.mjs')) {
  main().catch((err) => {
    console.error('Waveform extraction failed:', err);
    process.exit(1);
  });
}
