#!/usr/bin/env python3
"""
Automated Video Pipeline for Claude Design Promo (00:00 – 01:22)
Captures key sequence frames via Google Chrome Headless and renders an MP4 video with FFmpeg.
"""

import os
import sys
import time
import subprocess
import shutil

PROMO_URL_BASE = "http://localhost:3033/claude-design-promo.html"
FRAMES_DIR = "/tmp/claude_promo_frames"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_MP4 = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "promo", "claude-design-promo.mp4"))
CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def main():
    if not os.path.exists(CHROME_BIN):
        print(f"Error: Chrome binary not found at {CHROME_BIN}")
        sys.exit(1)

    # 1. Clean and prepare frames directory
    if os.path.exists(FRAMES_DIR):
        shutil.rmtree(FRAMES_DIR)
    os.makedirs(FRAMES_DIR, exist_ok=True)

    print("=== Step 1/3: Capturing Timeline Frames (00:00 to 01:22) ===")
    # 82 seconds total, sampling key animation increments
    # Fast sampling: 1 frame per second (83 frames) + key transition frames
    total_seconds = 82
    sample_rate = 1.0 # 1 fps for rapid high-quality sequence
    times = []
    t = 0.0
    while t <= total_seconds:
        times.append(round(t, 1))
        t += sample_rate

    # Add extra key transition frames
    key_times = [
        0.5, 1.2, 2.5, 4.0, 5.5, 6.2, # Scene 1
        8.0, 11.0, 12.5, 15.0, 18.0, 22.0, # Scene 2
        27.0, 30.5, 33.5, 38.0, 41.0, # Scene 3
        46.0, 48.0, 50.5, 52.0, 56.0, 59.0, 61.0, # Scene 4
        64.5, 67.5, 71.0, 75.0, 78.0, 81.0 # Scene 5
    ]
    all_times = sorted(list(set(times + key_times)))

    print(f"Rendering {len(all_times)} frames from headless browser...")
    for idx, sec in enumerate(all_times):
        frame_path = os.path.join(FRAMES_DIR, f"frame_{idx:04d}.png")
        url = f"{PROMO_URL_BASE}?clean=true&t={sec}&autoplay=false"
        user_data = f"/tmp/chrome_claude_{idx % 8}"
        cmd = [
            CHROME_BIN,
            "--headless",
            "--disable-gpu",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-networking",
            f"--user-data-dir={user_data}",
            "--window-size=1920,1080",
            "--virtual-time-budget=2000",
            "--run-all-compositor-stages-before-draw",
            f"--screenshot={frame_path}",
            url
        ]
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t_start = time.time()
        while time.time() - t_start < 5.0:
            if os.path.exists(frame_path) and os.path.getsize(frame_path) > 1000:
                break
            time.sleep(0.1)
        proc.terminate()
        try:
            proc.wait(timeout=1.0)
        except Exception:
            proc.kill()

        if (idx + 1) % 10 == 0 or idx == len(all_times) - 1:
            print(f"  [{idx + 1}/{len(all_times)}] Frame at {sec:.1f}s captured")

    print("\n=== Step 2/3: Encoding MP4 with FFmpeg ===")
    ffmpeg_bin = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
    
    # Render at smooth framerate (e.g., 24fps with frame duplication or duration matching)
    # Total animation runs 82s:
    fps = len(all_times) / total_seconds # ~1.3 fps raw, smooth output with setpts or standard 30fps
    
    encode_cmd = [
        ffmpeg_bin,
        "-y",
        "-framerate", f"{len(all_times)/82.0:.2f}",
        "-i", os.path.join(FRAMES_DIR, "frame_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-preset", "fast",
        "-crf", "18",
        OUTPUT_MP4
    ]
    
    res = subprocess.run(encode_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)

    file_size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    print(f"\n=== Step 3/3: Video Export Complete! ===")
    print(f"Output File: {OUTPUT_MP4}")
    print(f"File Size:   {file_size_mb:.2f} MB")
    print(f"Duration:    01:22 (82 seconds)")

if __name__ == "__main__":
    main()
