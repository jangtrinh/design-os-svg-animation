#!/usr/bin/env python3
"""
Automated Visual Evidence Capture for OpenAI Codex App Promo (V2 Kinematics)
Captures keyframes using Google Chrome Headless at 1920x1080 native resolution.
Saves image artifacts directly to the agent artifact directory for Visual Evidence Proof Mandate.
"""

import os
import sys
import subprocess
import shutil
import concurrent.futures
import time

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ARTIFACTS_DIR = "/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3"
BASE_URL = "http://127.0.0.1:4323/codex-app-promo.html"

FRAMES = [
    ("evidence_beat1_prompt_submit.png", 0.95, "Beat 1: Instant Hook — Prompt Card & Submit Click"),
    ("evidence_beat2_sidebar_thread.png", 2.80, "Beat 2: Window Morph & Sidebar Thread Selection"),
    ("evidence_beat2_streaming_chat.png", 8.20, "Beat 2: Live Multi-Agent Streaming Chat & Polish Summary"),
    ("evidence_beat3_review_dock.png", 13.00, "Beat 3: Review Changes Dock Click & Code Diff Transition"),
    ("evidence_beat3_inline_resolve.png", 17.50, "Beat 3: Line 103 Review Comment & Resolve Status Chip"),
    ("evidence_beat3_checkout_local.png", 21.00, "Beat 3: Checkout on Local Header Toolbar Click"),
    ("evidence_beat4_polaroid_drag_swap.png", 26.60, "Beat 4: Live Photobooth App — Dual Polaroid Drag & Reorder"),
    ("evidence_beat4_reordered_side_by_side.png", 30.50, "Beat 4: Reordered Gallery — Frog & Robot Swapped"),
    ("evidence_beat5_window_close.png", 33.80, "Beat 5: Red Window Close Dot & Spatial Recede"),
    ("evidence_beat5_outro_bounce.png", 34.80, "Beat 5: Spring Scale Bounce (0 to 100% from center with gentle friction)"),
    ("evidence_beat5_outro_lockup.png", 37.00, "Beat 5: OpenAI & Codex Authentic Vector Lockup")
]

def capture_frame(entry):
    idx, (filename, t_sec, label) = entry
    target_path = os.path.join(ARTIFACTS_DIR, filename)
    if os.path.exists(target_path):
        try:
            os.remove(target_path)
        except Exception:
            pass
    user_data = f"/tmp/chrome_evidence_{idx}_{int(time.time()*1000)%10000}"
    url = f"{BASE_URL}?clean=true&t={t_sec:.2f}&autoplay=false"
    
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
        f"--screenshot={target_path}",
        url
    ]
    
    for attempt in range(3):
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            t_poll_start = time.time()
            captured = False
            while time.time() - t_poll_start < 5.0:
                if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
                    captured = True
                    break
                time.sleep(0.15)
            proc.terminate()
            try:
                proc.wait(timeout=1.0)
            except Exception:
                proc.kill()
            if captured:
                shutil.rmtree(user_data, ignore_errors=True)
                return filename, t_sec, label, True, os.path.getsize(target_path)
        except Exception:
            pass
        time.sleep(0.3)
    shutil.rmtree(user_data, ignore_errors=True)
    return filename, t_sec, label, False, 0

def main():
    if not os.path.exists(CHROME_BIN):
        print(f"Error: Chrome binary not found at {CHROME_BIN}")
        sys.exit(1)
        
    print(f"📸 Capturing {len(FRAMES)} Visual Evidence Proofs into {ARTIFACTS_DIR}...")
    t0 = time.time()
    
    tasks = list(enumerate(FRAMES))
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(capture_frame, tasks))
        
    print(f"\nCompleted in {time.time() - t0:.2f}s:")
    all_ok = True
    for filename, t_sec, label, success, size in results:
        status = f"✓ ({size//1024} KB)" if success else "✗ FAILED"
        if not success:
            all_ok = False
        print(f"  [{status}] t={t_sec:05.2f}s | {filename} | {label}")
        
    if not all_ok:
        sys.exit(1)
    print("\n🎉 All 10 Visual Evidence Proofs captured and verified successfully!")

if __name__ == "__main__":
    main()
