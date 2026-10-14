"""Copy every on-screen excerpt verbatim from the CK-001 build record into data/evidence.json.
Each entry keeps its source path + line range so the video never shows a hand-typed claim."""
import json, sys
from pathlib import Path
R = Path.home() / 'Products/design-os-3d-blender'
B = R / 'builds/reference-keyboard'
S = Path(sys.argv[1])  # scratch dir with today's re-run logs
def lines(p, a, z):
    t = Path(p).read_text().splitlines()
    return {'path': str(Path(p).relative_to(R) if str(p).startswith(str(R)) else Path(p).name), 'from': a, 'to': z, 'lines': t[a - 1:z]}
def grep(p, needle, n=1):
    t = Path(p).read_text().splitlines()
    hits = [k for k, l in enumerate(t) if needle in l]
    i = hits[-1] if needle == 'AGENT_OK' else hits[0]  # a step's verdict is its LAST sentinel line
    return {'path': str(Path(p).relative_to(R)), 'from': i + 1, 'to': i + n, 'lines': t[i:i + n]}
E = {
  'ref_roles': lines(B / 'state.md', 38, 40),
  'ref_conflict': lines(B / 'state.md', 47, 51),
  'secondary': grep(B / 'state.md', 'Secondary sheets remain derivative'),
  'purpose': grep(B / 'interfaces.json', '"purpose"'),
  'layout_json': lines(B / 'layout.json', 4, 8),
  'spec_base': lines(B / 'spec-B.json', 13, 23),
  'pass01_doc': lines(B / 'pass-01-layout.py', 1, 1),
  'ok_layout': grep(B / 'runs/layout-r01/steps/layout/attempt-0001/stdout.log', 'AGENT_OK'),
  'pass02_emit': lines(B / 'pass-02-geometry.py', 59, 60),
  'ok_geometry': grep(B / 'runs/geometry-B03/steps/geometry/attempt-0001/stdout.log', 'AGENT_OK'),
  'gate_doc': lines(R / 'scripts/production-gate.py', 3, 5),
  'ok_gate': grep(B / 'runs/geometry-B03/steps/gate/attempt-0001/stdout.log', 'AGENT_OK'),
  'interfaces': lines(B / 'interfaces.json', 6, 9),
  'pass05_asserts': lines(B / 'pass-05-inspect.py', 43, 48),
  'ok_inspect': grep(B / 'runs/verification-B03/steps/inspect/attempt-0001/stdout.log', 'AGENT_OK'),
  'pass04_bind': lines(B / 'pass-04-presentation.py', 16, 18),
  'ok_presentation': grep(B / 'runs/presentation-B03/steps/presentation/attempt-0001/stdout.log', 'AGENT_OK'),
  'pass07_assert': lines(B / 'pass-07-reopen.py', 11, 14),
  'ok_reopen': grep(B / 'runs/verification-B03/steps/reopen/attempt-0001/stdout.log', 'AGENT_OK'),
  'ok_final_gate': grep(B / 'runs/verification-B03/steps/final-gate/attempt-0001/stdout.log', 'AGENT_OK'),
  'status': lines(B / 'delivery/r02/status.json', 38, 41),
  'r01_missing': lines(B / 'README-r01-history.md', 71, 72),
  'first_gate_failed': lines(B / 'state.md', 70, 72),
  'never_run': grep(R / 'docs/native-build-pipeline-lessons.md', 'pass-B-rotation.py'),
}
def gate_report():
    g = json.loads((B / 'runs/geometry-B03/steps/gate/attempt-0001/gate-report.json').read_text())
    return {k: g.get(k) for k in ('failed', 'required_checks_missing')}
E['gate_report_head'] = {'path': 'runs/geometry-B03/.../gate-report.json', 'value': gate_report()}
for name in ('p01.log', 'pcov.log', 'rot.log'):
    f = S / 'out' / name
    if f.exists():
        E['rerun_' + name.split('.')[0]] = {'path': f'scratch re-run 2026-10-14 · {name}', 'lines': [l for l in f.read_text().splitlines() if l.startswith(('AGENT_OK', 'AGENT_FAIL', 'builds/', '  UNREFERENCED', 'FAIL', 'PASS'))]}
home = str(Path.home())
assert home not in json.dumps(E), 'a local absolute path would appear on screen'
Path(__file__).with_name('data').joinpath('evidence.json').write_text(json.dumps(E, ensure_ascii=False, indent=1))
Path(__file__).with_name('data').joinpath('evidence.js').write_text('window.EVIDENCE = ' + json.dumps(E, ensure_ascii=False) + ';\n')  # file:// pages cannot fetch JSON
print(len(E), 'entries;', ', '.join(k for k in E))
