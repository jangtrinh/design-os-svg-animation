#!/usr/bin/env python3
"""
Captures visual evidence screenshot of docs/index.html (GitHub Pages) showing Example 3.
Saves image artifact to the conversation artifacts directory.
"""

import os
import sys
import subprocess
import time
import shutil

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ARTIFACTS_DIR = "/Users/jang/.gemini/antigravity/brain/f89cf83b-4c7a-4c1f-be9d-65a033a2abd3"
DOCS_DIR = "/Users/jang/Products/design-os-svg-animation/docs"

def main():
    target_path = os.path.join(ARTIFACTS_DIR, "evidence_github_pages_showcase.png")
    user_data = f"/tmp/chrome_docs_proof_{int(time.time()*1000)%10000}"
    
    # Start local http server for docs
    server_proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", "4323", "--bind", "127.0.0.1", "--directory", DOCS_DIR],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.0)
    
    try:
        url = "http://127.0.0.1:4323/index.html#showcase"
        cmd = [
            CHROME_BIN,
            "--headless",
            "--disable-gpu",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-networking",
            f"--user-data-dir={user_data}",
            "--window-size=1440,1600",
            "--virtual-time-budget=2000",
            "--run-all-compositor-stages-before-draw",
            f"--screenshot={target_path}",
            url
        ]
        
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t_start = time.time()
        captured = False
        while time.time() - t_start < 6.0:
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
            print(f"✓ GitHub Pages proof captured: {target_path} ({os.path.getsize(target_path)//1024} KB)")
        else:
            print("✗ Failed to capture GitHub Pages proof")
            sys.exit(1)
            
    finally:
        server_proc.terminate()
        try:
            server_proc.wait(timeout=1.0)
        except Exception:
            server_proc.kill()
        shutil.rmtree(user_data, ignore_errors=True)

if __name__ == "__main__":
    main()
