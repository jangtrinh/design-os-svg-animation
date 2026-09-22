#!/usr/bin/env python3
"""
render-example-gifs.py — Render high-quality 5s GIFs for README examples:
1. Example 1: Claude Design 3D Globe & Interactive Tweaks (from claude-design-promo.mp4, 8s to 13s)
2. Example 2: SaaS Vector Animation Engine (from saas-short.html, 2.0s to 7.0s)
"""

import os
import shutil
import subprocess
import sys

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FFMPEG_BIN = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
ASSETS_DIR = "/Users/jang/Products/design-os-svg-animation/docs/assets"
TMP_FRAMES_DIR = "/tmp/saas_short_gif_frames"

TMP_S2_DIR = "/tmp/claude_design_s2_gif_frames"

def render_example_1():
    print("=== Rendering Example 1: Claude Design 3D Globe & Tweaks (5s) ===")
    if os.path.exists(TMP_S2_DIR):
        shutil.rmtree(TMP_S2_DIR)
    os.makedirs(TMP_S2_DIR, exist_ok=True)

    out_gif = os.path.join(ASSETS_DIR, "example-1-claude-design-globe.gif")
    
    fps = 12
    start_t = 12.5
    duration = 5.0
    total_frames = int(fps * duration)

    print(f"Capturing {total_frames} frames from claude-design-promo.html (t={start_t}s to {start_t+duration}s)...")
    for i in range(total_frames):
        t_sec = start_t + (i / fps)
        frame_path = os.path.join(TMP_S2_DIR, f"frame_{i:04d}.png")
        url = f"http://localhost:3033/claude-design-promo.html?clean=true&t={t_sec:.3f}&autoplay=false"
        
        cmd = [
            CHROME_BIN,
            "--headless",
            "--disable-gpu",
            "--window-size=1920,1080",
            f"--screenshot={frame_path}",
            url
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if (i + 1) % 15 == 0 or i == total_frames - 1:
            print(f"  Captured {i+1}/{total_frames} frames (t={t_sec:.2f}s)")
            
    print("Encoding GIF with FFmpeg...")
    cmd_ffmpeg = [
        FFMPEG_BIN, "-y",
        "-framerate", str(fps),
        "-i", os.path.join(TMP_S2_DIR, "frame_%04d.png"),
        "-vf", "scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer",
        out_gif
    ]
    subprocess.run(cmd_ffmpeg, check=True)
    print(f"Generated: {out_gif} ({os.path.getsize(out_gif)} bytes)")

def render_example_2():
    print("\n=== Rendering Example 2: SaaS Vector Motion Short (5s) ===")
    if os.path.exists(TMP_FRAMES_DIR):
        shutil.rmtree(TMP_FRAMES_DIR)
    os.makedirs(TMP_FRAMES_DIR, exist_ok=True)
    
    out_gif = os.path.join(ASSETS_DIR, "example-2-saas-motion-engine.gif")
    
    # 5 seconds: 2.0s to 7.0s at 12 fps = 60 frames
    fps = 12
    start_t = 2.0
    duration = 5.0
    total_frames = int(fps * duration)
    
    print(f"Capturing {total_frames} frames from saas-short.html...")
    for i in range(total_frames):
        t_sec = start_t + (i / fps)
        frame_path = os.path.join(TMP_FRAMES_DIR, f"frame_{i:04d}.png")
        url = f"http://localhost:3033/saas-short.html?clean=true&t={t_sec:.3f}&autoplay=false"
        
        cmd = [
            CHROME_BIN,
            "--headless",
            "--disable-gpu",
            "--window-size=540,960",
            f"--screenshot={frame_path}",
            url
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if (i + 1) % 15 == 0 or i == total_frames - 1:
            print(f"  Captured {i+1}/{total_frames} frames (t={t_sec:.2f}s)")
            
    print("Encoding GIF with FFmpeg...")
    cmd_ffmpeg = [
        FFMPEG_BIN, "-y",
        "-framerate", str(fps),
        "-i", os.path.join(TMP_FRAMES_DIR, "frame_%04d.png"),
        "-vf", "scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer",
        out_gif
    ]
    subprocess.run(cmd_ffmpeg, check=True)
    print(f"Generated: {out_gif} ({os.path.getsize(out_gif)} bytes)")

if __name__ == "__main__":
    render_example_1()
    render_example_2()
    print("\n✅ Both 5s example GIFs generated successfully!")
