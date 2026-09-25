#!/usr/bin/env python3
"""Build local frame-pair boards for reviewing the Astra for Law recreation.

Run after ``node scripts/export-astra-law-video.mjs --proof``. The reference
video and comparison boards remain under ignored local paths.
"""

import argparse
import io
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat


def read_reference_frame(video: Path, seconds: float) -> Image.Image:
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(seconds),
            "-i", str(video), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-",
        ],
        check=True,
        capture_output=True,
    )
    return Image.open(io.BytesIO(result.stdout)).convert("RGB")


def proof_time(path: Path) -> float:
    return float(path.stem.removeprefix("frame-").replace("-", "."))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reference", type=Path, help="Local reference MP4; never committed")
    parser.add_argument("--proof-dir", type=Path, default=Path(".cache/astra-for-law/proofs"))
    parser.add_argument("--output-dir", type=Path, default=Path(".cache/astra-for-law/parity"))
    args = parser.parse_args()
    if not args.reference.is_file():
        parser.error(f"reference video is missing: {args.reference}")
    proofs = sorted(args.proof_dir.glob("frame-*.png"), key=proof_time)
    if not proofs:
        parser.error(f"no draft proof frames found in {args.proof_dir}; run --proof first")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    system_font = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
    font = ImageFont.truetype(str(system_font), 18) if system_font.is_file() else ImageFont.load_default()
    rows = []
    for proof in proofs:
        seconds = proof_time(proof)
        reference = read_reference_frame(args.reference, seconds).resize((960, 540))
        draft = Image.open(proof).convert("RGB").resize((960, 540))
        reference_small = reference.resize((320, 180))
        draft_small = draft.resize((320, 180))
        difference = ImageChops.difference(reference_small, draft_small)
        mean_error = sum(ImageStat.Stat(difference).mean) / 3
        rows.append((seconds, reference, draft, mean_error))

    for group in range(0, len(rows), 4):
        subset = rows[group:group + 4]
        board = Image.new("RGB", (1920, len(subset) * 576), "#e9e9e9")
        draw = ImageDraw.Draw(board)
        for index, (seconds, reference, draft, mean_error) in enumerate(subset):
            y = index * 576
            board.paste(reference, (0, y))
            board.paste(draft, (960, y))
            draw.text((12, y + 544), f"Reference {seconds:g}s", font=font, fill="#171717")
            draw.text((972, y + 544), f"Draft {seconds:g}s | mean pixel error {mean_error:.1f}/255", font=font, fill="#171717")
        destination = args.output_dir / f"board-{group // 4 + 1:02d}.jpg"
        board.save(destination, quality=91)
        print(destination)
    print("Pixel error locates regressions only; judge fidelity from aligned frames and motion.")


if __name__ == "__main__":
    main()
