/**
 * karaoke-caption.mjs — Word-by-Word Speech Caption Chunker & Safe Zone Formatter
 * 
 * Groups Whisper ASR word timestamps into 3-5 word high-impact phrase cards,
 * automatically positioned inside the 9:16 or 16:9 safe zones.
 */

import { auditSafeZone } from '../geometry/viewport.mjs';

export class KaraokeCaptionManager {
  constructor(options = {}) {
    this.aspectKey = options.aspectKey || '9:16';
    this.wordsPerCard = options.wordsPerCard || 4;
    this.phrases = [];
  }

  /**
   * Ingests Whisper word timestamps: [{ word, start, end }]
   */
  ingestWordTimestamps(words = []) {
    this.phrases = [];
    let currentChunk = [];

    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i]);

      const isPunctuationBreak = /[.!?]$/.test(words[i].word);
      const isMaxChunk = currentChunk.length >= this.wordsPerCard;
      const isLast = i === words.length - 1;

      if (isPunctuationBreak || isMaxChunk || isLast) {
        this.phrases.push({
          phraseIndex: this.phrases.length,
          startTime: currentChunk[0].start,
          endTime: currentChunk[currentChunk.length - 1].end,
          words: currentChunk
        });
        currentChunk = [];
      }
    }

    return this.phrases;
  }

  /**
   * Retrieves active phrase and active word index for a given timestamp.
   */
  getActiveAt(timeSeconds) {
    const activePhrase = this.phrases.find(
      (p) => timeSeconds >= p.startTime && timeSeconds <= p.endTime
    );

    if (!activePhrase) return null;

    let activeWordIndex = activePhrase.words.findIndex(
      (w) => timeSeconds >= w.start && timeSeconds <= w.end
    );

    if (activeWordIndex === -1) {
      activeWordIndex = activePhrase.words.length - 1;
    }

    return {
      phrase: activePhrase,
      activeWordIndex,
      words: activePhrase.words.map((w) => w.word)
    };
  }

  /**
   * Verifies caption placement against aspect ratio safe zone.
   */
  validatePlacement(y = 1400, fontSize = 48) {
    // In 9:16 vertical, captions typically sit at y=1300..1450 (above bottom 18% CTA zone)
    const testBounds = {
      x: 108,
      y: y - fontSize,
      width: 864,
      height: fontSize * 1.5
    };

    return auditSafeZone(testBounds, this.aspectKey);
  }
}
