"""Loop the project's music source into a bed of whole 8-bar phrases: intro + body x N + outro.
All parameters come from <project>/tutorial.config.json: grid.bpm / grid.db0 (measured on the file), music.file, music.bed and
music.bedParams {introBars, bodyStart, bodyEnd, outroBar, phrases}. Body = bars bodyStart..bodyEnd-1, repeated in 8-bar phrases;
every seam lands on a downbeat with a 20 ms equal-power crossfade, so the bar grid stays continuous: bar(n) = DB0 + n * BAR.
Needs numpy (Blender's bundled python has it):
  /Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 -I build-music-bed.py <project dir> [phrases]"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

HERE = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
CFG = json.loads((HERE / 'tutorial.config.json').read_text())
BP = CFG['music'].get('bedParams')
if not BP:
    sys.exit('tutorial.config.json has no music.bedParams: this project mixes music.bed as is')
SRC = HERE / CFG['music']['file']
SR, BAR, DB0 = 48000, 4 * 60 / CFG['grid']['bpm'], CFG['grid']['db0']
INTRO, BODY0, BODY1, OUTRO = BP['introBars'], BP['bodyStart'], BP['bodyEnd'], BP['outroBar']   # bar indices
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
    body = x[at(BODY0):at(BODY1) + XF]                      # one extra crossfade so each loop keeps its full length
    full, rest = divmod(phrases, (BODY1 - BODY0) // 8)
    parts = [x[:at(INTRO) + XF]] + [body] * full + ([x[at(BODY0):at(BODY0 + 8 * rest) + XF]] if rest else [])
    parts.append(x[at(OUTRO - 1):])                         # bar 68 leads into the fade-out
    bed = splice(parts)
    expect = at(INTRO) + phrases * 8 * (at(1) - at(0)) + (len(x) - at(OUTRO - 1))
    assert abs(len(bed) - expect) < SR * 0.01, (len(bed), expect)
    out = HERE / CFG['music']['bed']
    with wave.open(str(out), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(bed, -1, 1) * 32767).astype('<i2').tobytes())
    print(f'music bed {len(bed) / SR:.3f} s = intro {INTRO} + {phrases} phrases x 8 bars + outro; config duration (T) = {len(bed) / SR:.3f}')

main(int(sys.argv[2]) if len(sys.argv) > 2 else BP.get('phrases', 1))
