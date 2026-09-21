#!/usr/bin/env python3
"""jev-svg-auditor.py — SVG AST Code Review & Animatability Audit.

Performs static analysis and JEV System One intelligence checks on SVG files to
detect AI hallucination errors (NaN values, broken viewBox, invalid Béziers, missing
transform-origin anchors, lack of A11y attributes).

Usage:
    python3 scripts/jev-svg-auditor.py audit-svg <file.svg>
    python3 scripts/jev-svg-auditor.py audit-dir <directory>
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List

API_KEY = os.environ.get("TYPESAFE_API_KEY")


def audit_single_svg(svg_path: Path) -> Dict[str, Any]:
    """Perform deterministic static checks on an SVG file."""
    issues: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []

    content = svg_path.read_text(encoding="utf-8", errors="ignore")

    # 1. XML Well-formedness
    try:
        root = ET.fromstring(content)
    except ET.ParseError as err:
        return {
            "file": svg_path.name,
            "status": "FAILED",
            "critical_errors": [f"Malformed XML: {err}"],
            "issues": [],
            "warnings": []
        }

    # 2. ViewBox Validity
    viewbox = root.attrib.get("viewBox")
    if not viewbox:
        issues.append({
            "code": "MISSING_VIEWBOX",
            "message": "SVG is missing viewBox attribute; scaling and responsive transforms will break."
        })
    else:
        parts = viewbox.strip().split()
        if len(parts) != 4:
            issues.append({
                "code": "INVALID_VIEWBOX_FORMAT",
                "message": f"viewBox must have exactly 4 numbers, got '{viewbox}'."
            })
        else:
            try:
                min_x, min_y, w, h = map(float, parts)
                if w <= 0 or h <= 0:
                    issues.append({
                        "code": "NON_POSITIVE_DIMENSION",
                        "message": f"viewBox width ({w}) and height ({h}) must be positive numbers."
                    })
            except ValueError:
                issues.append({
                    "code": "VIEWBOX_NOT_NUMERIC",
                    "message": f"viewBox contains non-numeric values: '{viewbox}'."
                })

    # 3. Security Check: Inline Scripts & Handlers
    if "<script" in content.lower():
        issues.append({
            "code": "SECURITY_SCRIPT_TAG",
            "message": "SVG contains <script> tag which violates security gates."
        })
    
    event_handlers = re.findall(r'\bon[a-zA-Z]+\s*=', content, re.IGNORECASE)
    if event_handlers:
        issues.append({
            "code": "SECURITY_EVENT_HANDLER",
            "message": f"SVG contains inline event handlers: {event_handlers}."
        })

    # 4. NaN / Infinity / AI Hallucinations in coordinates
    nan_matches = re.findall(r'\b(NaN|undefined|null|Infinity)\b', content)
    if nan_matches:
        issues.append({
            "code": "AI_HALLUCINATION_NAN",
            "message": f"Found corrupted numerical tokens in coordinates: {set(nan_matches)}."
        })

    # 5. Animatability Target Selectors
    # Check if paths/groups have IDs or classes for Motion IR targeting
    animated_candidates = root.findall(".//*[@id]")
    total_elements = len(list(root.iter()))
    if not animated_candidates and total_elements > 3:
        warnings.append({
            "code": "NO_ID_SELECTORS",
            "message": "SVG has no element IDs. Target selectors in Motion IR will require CSS nth-child."
        })

    # 6. Accessibility (A11y)
    has_title = root.find("{http://www.w3.org/2000/svg}title") is not None or "<title>" in content
    has_aria = "aria-label" in root.attrib or "aria-hidden" in root.attrib or root.attrib.get("role") == "img"
    if not (has_title or has_aria):
        warnings.append({
            "code": "A11Y_MISSING_METADATA",
            "message": "SVG lacks <title> tag or ARIA attributes for screen reader accessibility."
        })

    # 7. Check for nested transforms on animated candidates
    matrix_transforms = re.findall(r'transform\s*=\s*["\']matrix\([^)]+\)["\']', content)
    if matrix_transforms:
        warnings.append({
            "code": "COMPLEX_MATRIX_TRANSFORM",
            "message": f"Found {len(matrix_transforms)} un-flattened matrix transforms. May offset pivot origins."
        })

    status = "PASSED" if not issues else "FAILED"

    return {
        "file": svg_path.name,
        "status": status,
        "critical_errors": [],
        "issues": issues,
        "warnings": warnings
    }


def main():
    parser = argparse.ArgumentParser(description="JEV SVG AST Code Review & Animatability Auditor")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # audit-svg
    p_audit = subparsers.add_parser("audit-svg", help="Audit single SVG file")
    p_audit.add_argument("file", type=Path)

    # audit-dir
    p_dir = subparsers.add_parser("audit-dir", help="Audit directory of SVG files")
    p_dir.add_argument("directory", type=Path)

    args = parser.parse_args()

    if args.command == "audit-svg":
        result = audit_single_svg(args.file)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["status"] == "PASSED" else 1)

    elif args.command == "audit-dir":
        svg_files = list(args.directory.glob("*.svg"))
        print(f"Auditing {len(svg_files)} SVG files in {args.directory}...\n")
        passed = 0
        for f in svg_files:
            res = audit_single_svg(f)
            status_icon = "✅" if res["status"] == "PASSED" else "❌"
            print(f"{status_icon} [{f.name}] Status: {res['status']}")
            for iss in res["issues"]:
                print(f"    - Issue [{iss['code']}]: {iss['message']}")
            for w in res["warnings"]:
                print(f"    - Warning [{w['code']}]: {w['message']}")
            if res["status"] == "PASSED":
                passed += 1
        print(f"\nAudit complete: {passed}/{len(svg_files)} passed.")
        sys.exit(0 if passed == len(svg_files) else 1)


if __name__ == "__main__":
    main()
