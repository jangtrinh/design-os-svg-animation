#!/usr/bin/env python3
"""Drive render-orbit-passes.py for every showcased model; fails loudly on a missing AGENT_OK."""
import json, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'assets' / 'orbit'
REPO = Path.home() / 'Products/design-os-3d-blender'
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
HIFI_FROM = 30  # hi-fi is only revealed from orbit frame ~36 on; earlier frames are never shown

MODELS = [
    ('ck', 'builds/reference-keyboard/delivery/r02/CK-001.blend', 'RK_CAMERA', 1, 96, {}),
    ('dc', 'builds/desktop-companion/delivery/R03/native/dc01-demo.blend', 'DEMO_CAMERA', 1, 96, {}),
    ('arm', 'builds/robot-arm-original-refined/arm-original-refined.blend', 'A3-Step-assembly-camera', 3000, 72,
     {'lens_mul': 0.72, 'studio_re': '(?i)^A3-stage$'}),
    ('ww', 'builds/watch-winder-capsule/watch-winder-capsule.blend', 'WW_CAM_HERO', 1, 72, {}),
]
only = set(sys.argv[1:])
for name, blend, cam, frame, n, extra in MODELS:
    if only and name not in only:
        continue
    for passes, idx, more in ((['wire', 'clay'], range(n), {}), (['hifi'], range(HIFI_FROM, n), {'samples': 48, 'device': 'METAL'})):
        args = {'cam': cam, 'frame': frame, 'out': str(OUT / name), 'res': [1920, 1080], 'orbit_n': n,
                'arc_deg': 24, 'indices': list(idx), 'passes': passes, **extra, **more}
        t0 = time.time()
        p = subprocess.run([BLENDER, '-b', '--factory-startup', str(REPO / blend), '--python',
                            str(HERE / 'render-orbit-passes.py'), '--', json.dumps(args)], capture_output=True, text=True)
        last = [l for l in p.stdout.splitlines() if l.startswith(('AGENT_OK', 'AGENT_FAIL'))]
        if not last or not last[-1].startswith('AGENT_OK'):
            print(f'FAIL {name} {passes}\n{p.stdout[-1500:]}\n{p.stderr[-1500:]}', flush=True)
            sys.exit(1)
        print(f'{name} {passes} {time.time() - t0:.0f}s {last[-1][:220]}', flush=True)
