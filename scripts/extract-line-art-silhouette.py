#!/usr/bin/env python3
"""extract-line-art-silhouette.py — filled outline of a line drawing, for occlusion.

A line drawing has no fills, so anything placed behind it shows through. This finds
the drawing's outer silhouette: close small gaps, flood the background from the image
border, keep everything the flood cannot reach, then trace that region's boundary.

Requires numpy, pillow, scipy, scikit-image (throwaway venv; not a runtime dependency).

Usage:
  python3 scripts/extract-line-art-silhouette.py <airframe.png> <out.json> [--close 6] [--epsilon 1.2]
"""

from __future__ import annotations

import argparse
import json

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.measure import find_contours
from skimage.morphology import disk

import importlib.util
import pathlib

# reuse the tracer's Ramer-Douglas-Peucker instead of duplicating it
_spec = importlib.util.spec_from_file_location(
    "tracer", pathlib.Path(__file__).with_name("trace-line-art-centerline.py"))
_tracer = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_tracer)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("out")
    ap.add_argument("--close", type=int, default=6, help="gap-closing radius in px")
    ap.add_argument("--epsilon", type=float, default=1.2)
    ap.add_argument("--min-area", type=float, default=1500)
    args = ap.parse_args()

    ink = np.asarray(Image.open(args.image).convert("L")) < 200
    closed = ndimage.binary_dilation(ink, structure=disk(args.close))
    labels, _ = ndimage.label(~closed)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    background = np.isin(labels, list(border))
    # grow back to where the ink really is; the fill then sits under the line's outer edge
    silhouette = ndimage.binary_erosion(~background, structure=disk(args.close - 1))
    silhouette = ndimage.binary_fill_holes(silhouette)

    polygons = []
    for contour in find_contours(silhouette.astype(float), 0.5):
        xy = contour[:, ::-1]
        area = 0.5 * abs(np.dot(xy[:, 0], np.roll(xy[:, 1], 1)) - np.dot(xy[:, 1], np.roll(xy[:, 0], 1)))
        if area < args.min_area:
            continue
        simple = _tracer.rdp(xy, args.epsilon)
        polygons.append([[round(float(x), 1), round(float(y), 1)] for x, y in simple])

    json.dump({"polygons": polygons}, open(args.out, "w"))
    print(f"silhouette: {len(polygons)} polygon(s), {sum(len(p) for p in polygons)} points")


if __name__ == "__main__":
    main()
