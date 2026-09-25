#!/usr/bin/env python3
"""build-flipbook-rotor-geometry.py — 3D-rendered rotor flipbook -> light, animatable geometry.

Stage 3 of the line-art-to-motion pipeline for VECTOR sources that ship a rotor flipbook
(e.g. Blender Freestyle renders: a static group + N `pose-XXX` groups, one per rotor angle).
Shipping every pose is heavy (MiniPro: 12 MB) because each pose repeats the whole airframe.
This keeps what actually changes:

  static  = the flipbook's static group + pose-000's non-blade strokes + airframe strokes
            that pose-000 hid behind a blade (recovered from quarter-turn poses), so arms have
            no gaps when the blades move away.
  poses   = per pose, only the blade strokes: presence (share of other poses still drawing
            the stroke) below 0.3; airframe sits at 0.7-1.0 (see presence()).
            Kept as one combined path per pose (exact 3D projection, foreshortening, twist).

Static strokes are ordered from the body outward and merged into chunks for a draw-on reveal.
Output: a JSON geometry file consumed by the case's JS module builder.

Requires numpy, scipy (throwaway venv). Reuses rdp() from trace-line-art-centerline.py.
Usage: python3 scripts/build-flipbook-rotor-geometry.py <flipbook.svg> <out.json> \
         --origin x,y [--chunk 12] [--epsilon 0.15]
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import math
import pathlib
import re

import numpy as np
from scipy.spatial import cKDTree

_spec = importlib.util.spec_from_file_location("tracer", pathlib.Path(__file__).with_name("trace-line-art-centerline.py"))
_tracer = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_tracer)

NUM = re.compile(r"-?\d+\.?\d*")


def points(d: str) -> np.ndarray:
    n = [float(x) for x in NUM.findall(d)]
    return np.array(list(zip(n[0::2], n[1::2])), dtype=float)


def encode(p: np.ndarray, eps: float) -> str:
    q = _tracer.rdp(p, eps) if len(p) > 2 else p
    return "M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in q)


def length(p: np.ndarray) -> float:
    return float(np.linalg.norm(np.diff(p, axis=0), axis=1).sum()) if len(p) > 1 else 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("flipbook")
    ap.add_argument("out")
    ap.add_argument("--origin", required=True, help="x,y where the draw-on starts (body centre)")
    ap.add_argument("--chunk", type=int, default=12, help="static strokes per drawn path")
    ap.add_argument("--epsilon", type=float, default=0.15)
    ap.add_argument("--gap", type=float, default=1.5)
    ap.add_argument("--static-svg", help="also write the static layer as SVG (silhouette input)")
    ap.add_argument("--silhouette", help="silhouette JSON from extract-line-art-silhouette.py (pixel coords)")
    ap.add_argument("--px-per-unit", type=float, default=2.0, help="render scale used for --static-svg")
    ap.add_argument("--module", help="also write an ES module exporting the geometry")
    ap.add_argument("--export", default="FLIPBOOK_GEOMETRY", help="export name for --module")
    ap.add_argument("--blade-below", type=float, default=0.3, help="presence below this = blade stroke")
    ap.add_argument("--airframe-above", type=float, default=0.7, help="presence at/above this = airframe for gap recovery")
    args = ap.parse_args()
    origin = np.array([float(v) for v in args.origin.split(",")])

    text = open(args.flipbook, encoding="utf-8", errors="ignore").read()
    view_box = [float(v) for v in re.search(r'viewBox="([^"]+)"', text).group(1).split()]
    groups = {}
    for chunk in re.split(r'<g id="', text)[1:]:
        groups[chunk[: chunk.find('"')]] = [points(d) for d in re.findall(r'd="([^"]+)"', chunk[: chunk.find("</g>")])]
    poses = sorted(k for k in groups if k.startswith("pose-"))
    n, quarter = len(poses), len(poses) // 4
    pose_paths = [[p for p in groups[k] if len(p)] for k in poses]
    trees = [cKDTree(np.vstack(ps)) for ps in pose_paths]

    # Presence = share of other poses in which a stroke is still drawn. Measured on the MiniPro
    # flipbook it is sharply bimodal: blades 0-0.3, airframe 0.7-1.0, and the few in between are
    # hub rims and struts that blades often hide (airframe). Thresholds come from that histogram.
    def presence(k: int) -> np.ndarray:
        paths = pose_paths[k]
        owner = np.repeat(np.arange(len(paths)), [len(p) for p in paths])
        counts = np.bincount(owner, minlength=len(paths))
        pts = np.vstack(paths)
        seen = np.zeros(len(paths))
        for j in range(n):
            if j != k:
                near = trees[j].query(pts)[0] <= args.gap
                seen += np.bincount(owner, weights=near, minlength=len(paths)) / counts > 0.6
        return seen / (n - 1)

    shares = [presence(k) for k in range(n)]
    blade_poses = [[p for p, v in zip(pose_paths[k], shares[k]) if v < args.blade_below] for k in range(n)]

    static = [p for p in groups["drone-static"] if len(p)] + [p for p, v in zip(pose_paths[0], shares[0]) if v >= args.blade_below]
    known = cKDTree(np.vstack(static))
    recovered = 0
    for k in range(1, n):  # airframe that pose-000's blades hid: confidently airframe, not yet drawn
        for p, v in zip(pose_paths[k], shares[k]):
            if v >= args.airframe_above and (known.query(p)[0] > args.gap).mean() > 0.6:
                static.append(p)
                recovered += 1
                known = cKDTree(np.vstack(static))

    static.sort(key=lambda p: float(np.linalg.norm(p.mean(axis=0) - origin)))
    chunks = []
    for i in range(0, len(static), args.chunk):
        part = static[i: i + args.chunk]
        chunks.append({"order": len(chunks), "length": round(sum(length(p) for p in part)), "d": " ".join(encode(p, args.epsilon) for p in part)})

    out = {
        "viewBox": view_box,
        "flipbookPoses": n,
        "staticStrokes": len(static),
        "recoveredAirframeStrokes": recovered,
        "static": chunks,
        "bladePoses": [" ".join(encode(p, args.epsilon) for p in blades) for blades in blade_poses],
    }
    if args.silhouette:  # polygons in pixels of a render at px-per-unit scale -> viewBox units
        polys = json.load(open(args.silhouette))["polygons"]
        k = args.px_per_unit
        out["silhouette"] = " ".join("M" + " L".join(f"{x / k + view_box[0]:.1f},{y / k + view_box[1]:.1f}" for x, y in poly) + " Z" for poly in polys)
    json.dump(out, open(args.out, "w"))
    if args.static_svg:  # static layer only, for the silhouette extractor
        w, h = view_box[2] * args.px_per_unit, view_box[3] * args.px_per_unit
        body = "".join(f'<path d="{c["d"]}"/>' for c in chunks)
        open(args.static_svg, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(map(str, view_box))}" width="{w:.0f}" height="{h:.0f}"><rect x="{view_box[0]}" y="{view_box[1]}" width="{view_box[2]}" height="{view_box[3]}" fill="#fff"/><g fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>')
    if args.module:
        banner = (f"/**\n * {pathlib.Path(args.module).name} — GENERATED by scripts/build-flipbook-rotor-geometry.py.\n"
                  f" * Do not edit by hand. Source flipbook: {pathlib.Path(args.flipbook).name}. Units: its viewBox.\n */\n")
        pathlib.Path(args.module).write_text(banner + f"export const {args.export} = {json.dumps(out)};\n")
    size = sum(len(c["d"]) for c in chunks) + sum(len(b) for b in out["bladePoses"])
    print(f"static {len(static)} strokes (+{recovered} recovered) in {len(chunks)} chunks; "
          f"{n} blade poses, {sum(len(b) for b in blade_poses) / n:.0f} strokes/pose; ~{size / 1e3:.0f} KB of path data")


if __name__ == "__main__":
    main()
