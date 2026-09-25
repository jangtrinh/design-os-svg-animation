#!/usr/bin/env python3
"""trace-line-art-centerline.py — deterministic centerline tracer for single-line drawings.

Turns a raster line drawing (dark ink on light paper) into smooth SVG centerline
strokes, so the drawing can be animated as real strokes (draw-on, per-part motion)
instead of filled outlines. Geometry comes from the pixels, never from hand-typed paths.

Pipeline: threshold -> skeletonize (skan graph) -> prune crossing spurs -> re-chain
strokes through crossings -> smooth + Ramer-Douglas-Peucker -> JSON polylines.

Requires numpy, pillow, scikit-image, skan (use a throwaway venv; not a runtime dependency).

Usage:
  python3 scripts/trace-line-art-centerline.py <image> <out.json> \
      [--threshold 150] [--ignore x0,y0,x1,y1 ...] [--spur 10] [--epsilon 0.9]
"""

from __future__ import annotations

import argparse
import json
import math

import numpy as np
from PIL import Image
from skan import Skeleton, summarize
from skimage.morphology import skeletonize

def load_ink(path: str, threshold: int, ignore: list[tuple[int, int, int, int]], upscale: int) -> np.ndarray:
    """Bicubic upscale before thresholding keeps near-parallel lines from fusing."""
    img = Image.open(path).convert("L")
    if upscale > 1:
        img = img.resize((img.width * upscale, img.height * upscale), Image.BICUBIC)
    ink = np.asarray(img) < threshold
    for x0, y0, x1, y1 in ignore:
        ink[y0 * upscale:y1 * upscale, x0 * upscale:x1 * upscale] = False
    return ink


def skeleton_paths(ink: np.ndarray, spur: int) -> list[np.ndarray]:
    """Skeletonize, prune crossing spurs, return pixel paths as (N, 2) arrays of (x, y)."""
    skel = Skeleton(skeletonize(ink))
    for _ in range(4):
        stats = summarize(skel, separator="_")
        tiny = stats[(stats.branch_type == 1) & (stats.branch_distance < spur)].index
        dust = stats[(stats.branch_type == 0) & (stats.branch_distance < spur)].index
        drop = list(tiny) + list(dust)
        if not drop:
            break
        skel = skel.prune_paths(drop)
    return [skel.path_coordinates(i)[:, ::-1].astype(float) for i in range(skel.n_paths)]


def chain_through_junctions(paths: list[np.ndarray], snap: float = 4.0, probe: int = 10) -> list[np.ndarray]:
    """Re-join paths across line crossings by pairing the straightest continuations.

    A single-line drawing crosses itself constantly; the skeleton cuts it at every
    crossing. Pairing ends whose tangents are near anti-parallel restores long strokes,
    which is what makes a believable pen-order draw-on.
    """
    ends = []  # (path index, which end, point, outward direction)
    for i, p in enumerate(paths):
        if len(p) < 2:
            continue
        for which, pt, inner in ((0, p[0], p[min(probe, len(p) - 1)]), (1, p[-1], p[max(-probe - 1, -len(p))])):
            d = pt - inner
            n = math.hypot(*d) or 1.0
            ends.append((i, which, pt, d / n))
    link = {}
    used = set()
    candidates = []
    for a in range(len(ends)):
        for b in range(a + 1, len(ends)):
            ia, wa, pa, da = ends[a]
            ib, wb, pb, db = ends[b]
            if ia == ib or math.hypot(*(pa - pb)) > snap:
                continue
            straightness = -float(np.dot(da, db))  # 1.0 = perfectly straight through
            if straightness > 0.6:
                candidates.append((straightness, a, b))
    for _, a, b in sorted(candidates, reverse=True):
        if a in used or b in used:
            continue
        used.update((a, b))
        link[(ends[a][0], ends[a][1])] = (ends[b][0], ends[b][1])
        link[(ends[b][0], ends[b][1])] = (ends[a][0], ends[a][1])

    visited = set()
    strokes = []

    def extend(idx, entered_at):
        chain = []
        while idx not in visited:
            visited.add(idx)
            p = paths[idx] if entered_at == 0 else paths[idx][::-1]
            chain.append(p if not chain else p[1:])
            exit_end = 1 - entered_at
            nxt = link.get((idx, exit_end))
            if nxt is None:
                break
            idx, entered_at = nxt
        return chain

    # start from free ends first so open strokes begin at a real line end
    order = sorted(range(len(paths)), key=lambda i: ((i, 0) in link) and ((i, 1) in link))
    for i in order:
        if i in visited:
            continue
        back = link.get((i, 0))
        forward = extend(i, 0)
        # grow backwards from the start end as well
        backward = []
        if back is not None and back[0] not in visited:
            backward = extend(back[0], back[1])
        pieces = [seg[::-1] for seg in reversed(backward)] + forward
        strokes.append(np.vstack(pieces))
    return strokes


def smooth(points: np.ndarray, window: int = 2) -> np.ndarray:
    if len(points) <= 2 * window + 1:
        return points
    closed = np.allclose(points[0], points[-1])
    out = points.copy().astype(float)
    n = len(points)
    for i in range(n):
        if closed:
            idx = [k % (n - 1) for k in range(i - window, i + window + 1)]
        else:
            if i == 0 or i == n - 1:
                continue  # endpoints stay pinned to junctions
            reach = min(window, i, n - 1 - i)  # symmetric window keeps ends from drifting
            idx = list(range(i - reach, i + reach + 1))
        out[i] = points[idx].mean(axis=0)
    if closed:
        out[-1] = out[0]
    return out


def rdp(points: np.ndarray, epsilon: float) -> np.ndarray:
    if len(points) < 3:
        return points
    start, end = points[0], points[-1]
    seg = end - start
    seg_len = math.hypot(*seg)
    if seg_len == 0:
        dists = np.hypot(*(points - start).T)
    else:
        rel = points - start
        dists = np.abs(seg[0] * rel[:, 1] - seg[1] * rel[:, 0]) / seg_len
    i = int(np.argmax(dists))
    if dists[i] > epsilon:
        left = rdp(points[: i + 1], epsilon)
        right = rdp(points[i:], epsilon)
        return np.vstack([left[:-1], right])
    return np.vstack([start, end])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("out")
    ap.add_argument("--threshold", type=int, default=150)
    ap.add_argument("--ignore", action="append", default=[])
    ap.add_argument("--spur", type=int, default=10)
    ap.add_argument("--epsilon", type=float, default=0.9)
    ap.add_argument("--upscale", type=int, default=3)
    args = ap.parse_args()

    ignore = [tuple(int(v) for v in box.split(",")) for box in args.ignore]
    ink = load_ink(args.image, args.threshold, ignore, args.upscale)
    k = args.upscale
    paths = chain_through_junctions(skeleton_paths(ink, args.spur * k), snap=4.0 * k, probe=10 * k)

    strokes = []
    for pts in sorted(paths, key=len, reverse=True):
        if len(pts) < args.spur * k:
            continue
        pts = rdp(smooth(pts, 3 * k), args.epsilon * k) / k
        strokes.append([[round(float(x), 1), round(float(y), 1)] for x, y in pts])

    h, w = ink.shape[0] // k, ink.shape[1] // k
    json.dump({"width": w, "height": h, "strokeWidth": 3, "strokes": strokes}, open(args.out, "w"))
    print(f"traced {len(strokes)} strokes, {sum(len(s) for s in strokes)} points from {args.image} ({w}x{h})")


if __name__ == "__main__":
    main()
