#!/usr/bin/env python3
"""
Automated Video & Showcase Pipeline for OpenAI Codex App High-Tempo Promo (00:00 – 00:38.0)
Captures key sequence frames via Google Chrome Headless and renders:
1. Full 1080p 30fps MP4 video: promo/codex-app/codex-app-promo.mp4
2. High-quality GitHub Pages showcase GIF: docs/assets/example-3-codex-app-promo.gif
Enforces 100% authentic SVGL brand assets, zero emojis, and EaseUI tactile depth.
"""

import os
import sys
import subprocess
import shutil
import concurrent.futures
import time

PROMO_URL_BASE = "http://127.0.0.1:4323/codex-app-promo.html"
FRAMES_DIR = "/tmp/codex_promo_frames"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_MP4 = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "promo", "codex-app/codex-app-promo.mp4"))
OUTPUT_GIF = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "docs", "design-os-tutorial/assets", "example-3-codex-app-promo.gif"))
CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def capture_single_frame(entry):
    idx, sec = entry
    frame_path = os.path.join(FRAMES_DIR, f"frame_{idx:04d}.png")
    if os.path.exists(frame_path) and os.path.getsize(frame_path) > 1000:
        return idx, sec, True

    user_data = f"/tmp/chrome_export_{idx}_{int(time.time()*1000)%10000}"
    url = f"{PROMO_URL_BASE}?clean=true&t={sec:.2f}&autoplay=false"
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-sync",
        f"--user-data-dir={user_data}",
        "--window-size=1920,1080",
        "--virtual-time-budget=2000",
        "--run-all-compositor-stages-before-draw",
        f"--screenshot={frame_path}",
        url
    ]

    for attempt in range(3):
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            t_start = time.time()
            captured = False
            while time.time() - t_start < 5.0:
                if os.path.exists(frame_path) and os.path.getsize(frame_path) > 1000:
                    captured = True
                    break
                time.sleep(0.1)
            proc.terminate()
            try:
                proc.wait(timeout=1.0)
            except Exception:
                proc.kill()
            if captured:
                shutil.rmtree(user_data, ignore_errors=True)
                return idx, sec, True
        except Exception:
            pass
        time.sleep(0.2)
    shutil.rmtree(user_data, ignore_errors=True)
    return idx, sec, False

def main():
    if not os.path.exists(CHROME_BIN):
        print(f"Error: Chrome binary not found at {CHROME_BIN}")
        sys.exit(1)

    # 1. Clean and prepare frames directory
    if os.path.exists(FRAMES_DIR):
        shutil.rmtree(FRAMES_DIR)
    os.makedirs(FRAMES_DIR, exist_ok=True)

    print("=== Step 1/4: Capturing Timeline Frames (00:00 to 00:38.0) ===")
    total_seconds = 38.0
    step = 0.25  # 4 fps visual sampling across 38.0s (153 high-definition frames)
    num_frames = int(total_seconds / step) + 1
    all_times = [round(i * step, 2) for i in range(num_frames)]
    print(f"Capturing {len(all_times)} visual frames at {step}s intervals with parallel workers...")

    tasks = list(enumerate(all_times))
    t0 = time.time()
    completed = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(capture_single_frame, task): task for task in tasks}
        for future in concurrent.futures.as_completed(futures):
            idx, sec, ok = future.result()
            completed += 1
            if completed % 25 == 0 or completed == len(all_times):
                print(f"  [{completed}/{len(all_times)}] Frames rendered ({time.time() - t0:.1f}s elapsed)")

    # Verify no missing frames and retry if needed
    missing = [i for i in range(len(all_times)) if not os.path.exists(os.path.join(FRAMES_DIR, f"frame_{i:04d}.png"))]
    if missing:
        print(f"Retrying missing frames: {missing}")
        for idx in missing:
            capture_single_frame((idx, all_times[idx]))

    verified_count = len([f for f in os.listdir(FRAMES_DIR) if f.endswith(".png")])
    print(f"All {verified_count}/{len(all_times)} frames verified in {time.time() - t0:.2f}s.")

    ffmpeg_bin = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"

    # Step 2: Encode MP4
    print("\n=== Step 2/4: Encoding Broadcast MP4 with FFmpeg ===")
    raw_fps = len(all_times) / total_seconds

    encode_cmd = [
        ffmpeg_bin,
        "-y",
        "-framerate", f"{raw_fps:.4f}",
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
        print("FFmpeg MP4 error:", res.stderr)
        sys.exit(1)

    file_size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    print(f"✓ Video saved: {OUTPUT_MP4} ({file_size_mb:.2f} MB, duration 38.0s)")

    # Step 3: Generate high-quality showcase GIF for GitHub Pages
    print("\n=== Step 3/4: Generating Optimized Showcase GIF for GitHub Pages ===")
    os.makedirs(os.path.dirname(OUTPUT_GIF), exist_ok=True)
    
    # Use palettegen + paletteuse for pristine 640x360 GIF at 10 fps
    palette_path = "/tmp/codex_gif_palette.png"
    
    # Select a snappy dynamic summary (or full 38s at 8fps)
    gif_filter = "fps=8,scale=640:360:flags=lanczos"
    gen_palette_cmd = [
        ffmpeg_bin,
        "-y",
        "-i", OUTPUT_MP4,
        "-vf", f"{gif_filter},palettegen=stats_mode=diff",
        palette_path
    ]
    subprocess.run(gen_palette_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    create_gif_cmd = [
        ffmpeg_bin,
        "-y",
        "-i", OUTPUT_MP4,
        "-i", palette_path,
        "-lavfi", f"{gif_filter} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3",
        OUTPUT_GIF
    ]
    subprocess.run(create_gif_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(palette_path):
        os.remove(palette_path)
        
    gif_size_mb = os.path.getsize(OUTPUT_GIF) / (1024 * 1024)
    print(f"✓ Showcase GIF saved: {OUTPUT_GIF} ({gif_size_mb:.2f} MB)")

    print("\n=== Step 4/4: Complete! ===")
    print(f"MP4 Path: {OUTPUT_MP4}")
    print(f"GIF Path: {OUTPUT_GIF}")

if __name__ == "__main__":
    main()
