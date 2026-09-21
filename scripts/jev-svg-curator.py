#!/usr/bin/env python3
"""jev-svg-curator.py — JEV System One Knowledge Harvester & Quality Curator for SVG Animation.

Leverages TypeSafe AI System One (sub-100ms structured inference) to assess,
score, link, and curate engineering knowledge for SVG Animation, Motion IR,
and AI-vector integration from conceptual to production grade.

Usage:
    python3 scripts/jev-svg-curator.py assess <file>
    python3 scripts/jev-svg-curator.py audit-catalog
    python3 scripts/jev-svg-curator.py link <file_a> <file_b>
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.request
from pathlib import Path
from typing import Any, Dict, List

API_KEY = os.environ.get("TYPESAFE_API_KEY")
URL = "https://api.typesafe.ai/v1/systemone"


def query_jev(state: str, questions: Dict[str, Any], model: str = "jev-latest") -> Dict[str, Any]:
    """Execute a structured System One query against JEV API."""
    if not API_KEY:
        raise ValueError("TYPESAFE_API_KEY environment variable is not set")

    payload = {
        "model": model,
        "state": state[:3500],  # Keep within context token budget
        "questions": questions
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("answers", {})
    except Exception as exc:
        return {"error": str(exc)}


def assess_technical_content(content: str, title: str = "") -> Dict[str, Any]:
    """Assess technical rigor, geometric/physical grounding, and domain classification."""
    questions = {
        "is_geometrically_grounded": {
            "type": "noul",
            "instructions": "Does this text contain concrete geometric, mathematical, or physical specifications (e.g. cubic-bezier, viewBox, coordinates, spring equations, milliseconds)?"
        },
        "engineering_rigor": {
            "type": "score",
            "instructions": "Level of engineering rigor and production readiness for SVG Animation",
            "criteria": [
                "Superficial (high level buzzwords only)",
                "Conceptual (describes logic but lacks formulas/tolerances)",
                "Detailed (contains formulas, specs, and constraints)",
                "Production Grade (contains tolerances, failure modes, GPU pipeline, and verification gates)"
            ]
        },
        "primary_domain": {
            "type": "choice",
            "instructions": "Primary SVG Animation knowledge domain",
            "criteria": {
                "geometry_dom": "SVG DOM, viewBox, paths, transforms, coordinate systems",
                "motion_physics": "Easing, cubic-bezier, spring kinematics, Disney animation principles",
                "morphing_topology": "Path interpolation, vertex resampling, topology, Flubber",
                "runtimes_compilers": "CSS keyframes, GSAP timeline, WAAPI, Lottie SVG, SMIL",
                "ai_pipeline_ir": "Intent parsing, semantic scene graph, Motion IR, prompt engineering",
                "interaction_state": "Micro-interactions, state machines, scroll-driven animation",
                "performance_gpu": "Rendering pipeline, GPU compositing, will-change, SVGO optimization"
            }
        },
        "has_failure_modes_and_limits": {
            "type": "noul",
            "instructions": "Does the text explicitly define failure modes, limitations, or safety guardrails?"
        }
    }
    header = f"Title: {title}\n" if title else ""
    return query_jev(f"{header}Content:\n{content}", questions)


def link_cross_domain_interfaces(content_a: str, content_b: str, title_a: str, title_b: str) -> Dict[str, Any]:
    """Identify interface ports and potential compatibility risks between two knowledge modules."""
    state = (
        f"Module A ({title_a}):\n{content_a[:1500]}\n\n"
        f"Module B ({title_b}):\n{content_b[:1500]}"
    )
    questions = {
        "interface_compatibility": {
            "type": "score",
            "instructions": "Cross-domain interface compatibility level",
            "criteria": [
                "Incompatible (conflicting assumptions or geometry formats)",
                "Partially compatible (requires parameter conversion)",
                "Compatible (interfaces align with standard pipeline)",
                "Synergistic (fully matched parameters and clean Motion IR coupling)"
            ]
        },
        "primary_coupling_surface": {
            "type": "choice",
            "instructions": "Where do these two subsystems primarily interface?",
            "criteria": {
                "dom_geometry_bridge": "SVG DOM to normalized Bézier geometry",
                "motion_ir_schema": "Motion IR representation connecting planning and compiler",
                "compiler_runtime_target": "Compiler code generation to target runtime (CSS/GSAP)",
                "quality_validation_gate": "Audit, linter, and validation check",
                "independent": "Minimal direct coupling"
            }
        }
    }
    return query_jev(state, questions)


def audit_catalog(catalog_dir: Path) -> Dict[str, Any]:
    """Audit all markdown files in the knowledge catalog."""
    md_files = sorted(catalog_dir.glob("*.md"))
    print(f"Auditing {len(md_files)} knowledge files in {catalog_dir.name} via JEV System One...")

    results = []
    for path in md_files:
        if path.name == "INDEX.md":
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        assessment = assess_technical_content(text, title=path.name)

        rigor = assessment.get("engineering_rigor", {}).get("score", 0.0)
        domain = assessment.get("primary_domain", {}).get("choice", "unknown")
        grounded = assessment.get("is_geometrically_grounded", {}).get("noul", 0.0)
        has_limits = assessment.get("has_failure_modes_and_limits", {}).get("noul", 0.0)

        results.append({
            "file": path.name,
            "domain": domain,
            "rigor_score": rigor,
            "grounded_prob": grounded,
            "has_limits_prob": has_limits
        })
        print(f"  [{path.name}] Domain: {domain:<20} | Rigor: {rigor:.2f}/3 | Grounded: {grounded:.2f} | Limits: {has_limits:.2f}")

    return {"count": len(results), "files": results}


def main():
    parser = argparse.ArgumentParser(description="JEV System One SVG Knowledge Curator")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # assess
    p_assess = subparsers.add_parser("assess", help="Assess a single markdown file")
    p_assess.add_argument("file", type=Path, help="Path to markdown file")

    # audit-catalog
    p_audit = subparsers.add_parser("audit-catalog", help="Audit all knowledge files")
    p_audit.add_argument("--dir", type=Path, default=Path(__file__).parent.parent / "knowledge")

    # link
    p_link = subparsers.add_parser("link", help="Check cross-domain interface compatibility")
    p_link.add_argument("file_a", type=Path)
    p_link.add_argument("file_b", type=Path)

    args = parser.parse_args()

    if args.command == "assess":
        text = args.file.read_text(encoding="utf-8")
        res = assess_technical_content(text, title=args.file.name)
        print(json.dumps(res, indent=2))

    elif args.command == "audit-catalog":
        res = audit_catalog(args.dir)
        avg_rigor = sum(f["rigor_score"] for f in res["files"]) / max(len(res["files"]), 1)
        print(f"\nAudit complete: {len(res['files'])} files evaluated.")
        print(f"Catalog Average Rigor Score: {avg_rigor:.2f} / 3.00")

    elif args.command == "link":
        text_a = args.file_a.read_text(encoding="utf-8")
        text_b = args.file_b.read_text(encoding="utf-8")
        res = link_cross_domain_interfaces(text_a, text_b, args.file_a.name, args.file_b.name)
        print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
