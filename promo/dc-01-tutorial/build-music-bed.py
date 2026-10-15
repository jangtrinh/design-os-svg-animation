"""Loop "Technology" (The_Mountain, Pixabay) into a music bed of whole 8-bar phrases: intro + body x N + outro.
Grid measured from the file: 135.00 BPM (onset comb, 0 ms drift over 100 s), bar 1.7778 s, first downbeat 0.654 s; intro = bars 0-11, steady body = bars
12-67 (7 phrases), outro = bar 69 onwards. Every seam lands on a downbeat with a 20 ms equal-power crossfade, so the
bar grid stays continuous: bar(n) = DB0 + n * BAR for the whole bed.
Needs numpy (Blender's bundled python has it):
  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 -I build-music-bed.py <phrases>"""
import subprocess, sys, wave
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
SRC = HERE / 'audio/the_mountain-technology-562622.mp3'
SR, BAR, DB0 = 48000, 4 * 60 / 135.0, 0.654
INTRO, BODY0, BODY1, OUTRO = 12, 12, 68, 69   # bar indices (body = bars 12..67, 56 bars)
XF = int(0.020 * SR)

def decode(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)

def at(bar): return int(round((DB0 + bar * BAR) * SR))

def splice(parts):
    out = parts[0]
    for p in parts[1:]:  # overlap XF samples across the seam, then keep the seam position on the grid
        w = np.sin(np.linspace(0, np.pi / 2, XF))[:, None]
        mixed = out[-XF:] * np.cos(np.linspace(0, np.pi / 2, XF))[:, None] + p[:XF] * w
        out = np.concatenate([out[:-XF], mixed, p[XF:]])
    return out

def main(phrases):
    x = decode(SRC)
    body = x[at(BODY0):at(BODY1) + XF]                      # one extra crossfade so each loop stays 56 bars long
    full, rest = divmod(phrases, 7)
    parts = [x[:at(INTRO) + XF]] + [body] * full + ([x[at(BODY0):at(BODY0 + 8 * rest) + XF]] if rest else [])
    parts.append(x[at(OUTRO - 1):])                         # bar 68 leads into the fade-out
    bed = splice(parts)
    expect = at(INTRO) + phrases * 8 * (at(1) - at(0)) + (len(x) - at(OUTRO - 1))
    assert abs(len(bed) - expect) < SR * 0.01, (len(bed), expect)
    out = HERE / 'audio/music-bed.wav'
    with wave.open(str(out), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(bed, -1, 1) * 32767).astype('<i2').tobytes())
    print(f'music bed {len(bed) / SR:.3f} s = intro 12 + {phrases} phrases x 8 bars + outro; T for the timeline = {len(bed) / SR:.3f}')

main(int(sys.argv[1]) if len(sys.argv) > 1 else 21)
