"""Mix the music window with UI sounds. Each sound's measured peak lands exactly on its event time."""
import json, sys, wave
import numpy as np

SR = 48000
here = sys.argv[1]
with wave.open(f'{here}/audio/edge-of-motion-b32-b51.wav') as w:
    music = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768
rng = np.random.default_rng(7)

def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / attack) * np.exp(-t / decay)

def tone(freqs, dur, decay, amp):
    t = np.arange(int(dur * SR)) / SR
    return amp * sum(np.sin(2 * np.pi * f * t) for f in freqs) / len(freqs) * env(len(t), 0.002, decay)

def click(dur, decay, amp, hp=2500):
    n = int(dur * SR); x = rng.standard_normal(n)
    x = x - np.convolve(x, np.ones(int(SR / hp)) / int(SR / hp), 'same')  # crude high-pass
    return amp * x * env(n, 0.0006, decay)

SOUNDS = {
    'click': click(0.03, 0.006, 0.33), 'key': click(0.02, 0.003, 0.14, 4000),
    'release': click(0.03, 0.008, 0.22, 1800),
    'pass': tone([880, 1318.5], 0.35, 0.09, 0.16), 'toast': tone([660, 990, 1320], 0.5, 0.12, 0.15),
}
events = json.load(open(f'{here}/out/sound-events.json'))
out = music.copy() * 0.92
for e in events:
    s = SOUNDS[e['kind']]; peak = int(np.argmax(np.abs(s)))
    start = int(round(e['t'] * SR)) - peak
    a, z = max(0, start), min(len(out), start + len(s))
    out[a:z] += s[a - start:z - start, None]
peak = np.abs(out).max()
out = out / max(1.0, peak / 0.95)
with wave.open(f'{here}/out/promo-audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f'mixed {len(events)} events, {len(out)/SR:.3f}s, input peak {peak:.3f}')
