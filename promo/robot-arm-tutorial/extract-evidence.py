"""Copy every on-screen excerpt verbatim from the ROBOT-ARM build record into data/evidence.js (and evidence.json).
Text excerpts keep path + line range; JSON excerpts keep path + the picked keys, so the video never shows a
hand-typed claim. Add one entry per excerpt in main(); the timeline reads them by key.
Run: python3 extract-evidence.py   (override the build folder with TUTORIAL_BUILD_DIR)"""
import json, os
from pathlib import Path

BUILD = Path(os.environ.get('TUTORIAL_BUILD_DIR') or os.path.expanduser('~/Products/design-os-3d-blender/builds/robot-arm-original-refined')).resolve()
PR = BUILD.parent / 'robot-arm-print-assembly'    # the print kit the refined film was built on
OR = BUILD
HERE = Path(__file__).parent
ROOT = BUILD.parent.parent                       # the repo that holds builds/<name>
rel = lambda p: str(Path(p).resolve().relative_to(ROOT))   # repo-relative: never an absolute home path

def lines(p, a, z):
    t = Path(p).read_text().splitlines()
    return {'path': rel(p), 'from': a, 'to': z, 'lines': t[a - 1:z]}

def clip(p, n, start, end=None):
    """A verbatim span of line n, from `start` through `end` (or the line end). Markdown bold markers are dropped;
    lead/more flag that the span starts or stops inside the line, so the card shows an ellipsis there."""
    line = Path(p).read_text().splitlines()[n - 1]
    a = line.index(start)
    z = line.index(end, a) + len(end) if end else len(line)
    return {'path': rel(p), 'from': n, 'to': n, 'excerpt': True, 'lead': bool(line[:a].strip('* ')), 'more': z < len(line),
            'lines': [line[a:z].replace('**', '')]}

def pick(p, *keys):
    d = json.loads(Path(p).read_text())
    return {'path': rel(p), 'value': {k: d[k] for k in keys}}

def sentinel(p):  # a step's verdict is its LAST sentinel line
    t = Path(p).read_text().splitlines()
    i = max(k for k, l in enumerate(t) if l.startswith(('AGENT_OK', 'AGENT_FAIL')))
    return {'path': rel(p), 'from': i + 1, 'to': i + 1, 'excerpt': True, 'lines': t[i:i + 1]}

def main():
    ev = {
        # act 1: input, contract, print kit
        'in_baseline': clip(OR / 'plan.md', 3, 'User-selected baseline:', 'arm-step-by-step.mp4.'),
        'in_correction': clip(OR / 'plan.md', 15, 'User correction:', 'supply box.'),
        'co_parts': clip(PR / 'README.md', 5, '38 separate', '6 TPU.'),
        'co_bed': clip(PR / 'README.md', 27, 'Assumed usable bed:', '220 mm**'),
        'co_load': clip(PR / 'README.md', 7, 'Not released for a 250 g', 'manufacture.'),
        'pr_plates': pick(PR / 'reports/plates-manifest.json', 'bed_mm', 'gap_mm'),
        'pr_export': pick(PR / 'reports/export-check.json', 'parts'),
        'pr_gate_failed': pick(PR / 'reports/gate-report-260906.json', 'failed'),
        # act 2: motion, the four repairs, the checks
        'mo_units': pick(OR / 'reports/independent-review/saved-candidate-check.json', 'source_meshes', 'physical_units', 'timed_events'),
        'b1_review': clip(PR / 'reports/independent-review/independent-review.md', 35, 'fails rigid', '110 mm'),
        'b1_repair': pick(PR / 'reports/servo-motion-repair.json', 'status'),
        'b2_heading': lines(OR / 'plan.md', 21, 21),
        'b2_stop': clip(OR / 'plan.md', 23, 'Full render stopped;', 'not deliverable.'),
        'b2_frame': pick(OR / 'reports/overlap-before.json', 'frame'),
        'b3_straight': clip(OR / 'plan.md', 31, 'e9323 waiting', 'servo cases.'),
        'b3_lift': clip(OR / 'plan.md', 31, 'Replaced with', 'vertical lowering;'),
        'ch_overlap': pick(OR / 'reports/independent-review/overlap-repair-check.json', 'status', 'frames'),
        'ch_clear': pick(OR / 'reports/clearance-acceptance.json', 'real_servo_case_collisions'),
        'b4_hero': clip(OR / 'plan.md', 33, 'Widened hero', 'fingertip clipping.'),
        'b4_reuse': pick(OR / 'reports/hero-prefix-reuse.json', 'frames', 'changed_source_frames'),
        # act 3: film and honest limits
        'fi_media': pick(OR / 'reports/media-check.json', 'frames', 'fps', 'full_decode_exit_code'),
        'li_spec': lines(PR / 'reports/gate-spec-260906.json', 4, 4),
        'li_wall': {**pick(PR / 'reports/gate-report-260906.json'), 'value': {'unchecked': [json.loads((PR / 'reports/gate-report-260906.json').read_text())['coverage']['unchecked'][1]]}},
        'li_blocked': clip(PR / 'reports/delivery-check.json', 9, 'BLOCKED:', 'local walls,'),
    }
    # counted, not typed: the gate's per-check verdicts (the voice says 836 checks and none failed)
    g = json.loads((PR / 'reports/gate-report-260906.json').read_text())
    from collections import Counter
    c = Counter(ch['status'] for part in g['parts'] for ch in part['checks'])
    ev['pr_gate_count'] = {'path': rel(PR / 'reports/gate-report-260906.json'), 'counted': True, 'value': dict(c)}
    assert c['pass'] == 836 and not g['failed'], c
    text = json.dumps(ev, ensure_ascii=False)
    assert '/Users/' not in text, 'an excerpt carries an absolute home path'
    (HERE / 'data').mkdir(exist_ok=True)
    (HERE / 'data/evidence.json').write_text(json.dumps(ev, ensure_ascii=False, indent=1))
    (HERE / 'data/evidence.js').write_text('window.EVIDENCE = ' + text + ';\n')
    print(f'{len(ev)} excerpts -> data/evidence.js')

main()
