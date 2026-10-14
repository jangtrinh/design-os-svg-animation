/**
 * Audio Drop / Climax Window Extractor & Mastered WAV Exporter
 *
 * Scans any input audio track (.mp3, .wav, .m4a, .flac) using a sliding RMS + dynamic-contrast
 * window and extracts the highest-impact segment of `durationSec` seconds with clean fade-in/out.
 */

import { execFileSync } from 'child_process';

/**
 * Decodes input audio via FFmpeg to 11.025kHz mono Float32 PCM in memory and finds the
 * start timestamp (in seconds) of the highest-energy drop window of length `durationSec`.
 */
export function findStrongestDropWindow(inputAudioPath, durationSec = 15.0, stepSec = 0.25) {
  const sr = 11025;
  const rawBuf = execFileSync('ffmpeg', [
    '-v', 'error',
    '-i', inputAudioPath,
    '-ac', '1',
    '-ar', String(sr),
    '-f', 'f32le',
    '-'
  ], { maxBuffer: 64 * 1024 * 1024 });

  const samples = new Float32Array(rawBuf.buffer, rawBuf.byteOffset, Math.floor(rawBuf.byteLength / 4));
  const winLen = Math.round(durationSec * sr);
  const stepLen = Math.max(1, Math.round(stepSec * sr));

  if (samples.length <= winLen) {
    return { startSec: 0, endSec: durationSec, score: 1.0 };
  }

  let bestStart = 0;
  let bestScore = -Infinity;

  for (let i = 0; i + winLen <= samples.length; i += stepLen) {
    let sumSq = 0;
    let firstQuarterSq = 0;
    const qLen = Math.floor(winLen / 4);
    for (let j = 0; j < winLen; j++) {
      const s = samples[i + j];
      const sq = s * s;
      sumSq += sq;
      if (j < qLen) firstQuarterSq += sq;
    }
    const rms = Math.sqrt(sumSq / winLen);
    const introRms = Math.sqrt(firstQuarterSq / Math.max(1, qLen));
    // Reward sustained RMS + punchy onset in the opening bar
    const score = rms * 0.75 + introRms * 0.25;
    if (score > bestScore) {
      bestScore = score;
      bestStart = i / sr;
    }
  }

  return {
    startSec: Number(bestStart.toFixed(2)),
    endSec: Number((bestStart + durationSec).toFixed(2)),
    score: Number(bestScore.toFixed(4))
  };
}

/**
 * Extracts the strongest `durationSec` segment from `inputAudioPath` and writes a
 * 44.1kHz 16-bit stereo WAV file with smooth fade-in and fade-out.
 */
export function extractMasteredDropWav(inputAudioPath, outputWavPath, durationSec = 15.0, opts = {}) {
  const { startSec } = opts.startSec !== undefined
    ? { startSec: opts.startSec }
    : findStrongestDropWindow(inputAudioPath, durationSec);

  const fadeIn = opts.fadeInSec ?? 0.18;
  const fadeOut = opts.fadeOutSec ?? 0.45;
  const fadeOutStart = Math.max(0, durationSec - fadeOut).toFixed(3);

  execFileSync('ffmpeg', [
    '-y',
    '-ss', String(startSec),
    '-t', String(durationSec),
    '-i', inputAudioPath,
    '-af', `afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}`,
    '-ar', '44100',
    '-ac', '2',
    '-c:a', 'pcm_s16le',
    outputWavPath
  ], { stdio: 'ignore' });

  return { startSec, durationSec, outputWavPath };
}
