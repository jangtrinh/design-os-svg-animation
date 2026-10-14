# `design-os-svg-animation` Prompt & CLI Cookbook

Copy-paste recipes for **DESIGN:OS SVG Animation Engine** (`skills/line-art-motion/SKILL.md`).

---

## 1. Generate & Scaffold

> "Create a 60fps SaaS product launch walkthrough with decoupled camera punch-ins, concentric cursor click ripples, and StudioPlayer controls."

## 2. Audit & Verify

> "Compile our SVG motion timeline into a self-contained HTML deliverable and run the 10-gate anti-flop verification audit."

## 3. Export & Automate

> "Verify that all cursor click hotspots align within <= 1.0px of target interactive bounds across 16:9 and 9:16 safe zones."

---

## 4. CLI & Diagnostic Commands

```bash
# Run deterministic offline self-check
python3 scripts/self_check.py

# Run primary domain verification / workflow
python3 scripts/anti-flop-gate.py

# Run primary CLI command
python3 scripts/anti-flop-gate.py
```
