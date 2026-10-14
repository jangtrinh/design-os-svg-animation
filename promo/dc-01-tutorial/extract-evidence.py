"""Copy every on-screen excerpt verbatim from the DC-01 build record into data/evidence.json.
Text excerpts keep path + line range; JSON excerpts keep path + the picked keys, so the video never shows a
hand-typed claim. Run: python3 extract-evidence.py"""
import json
from pathlib import Path
R = Path.home() / 'Products/design-os-3d-blender'
B = R / 'builds/desktop-companion'
rel = lambda p: str(Path(p).relative_to(R))

def lines(p, a, z):
    t = Path(p).read_text().splitlines()
    return {'path': rel(p), 'from': a, 'to': z, 'lines': t[a - 1:z]}

def grep(p, needle, n=1, last=False):
    t = Path(p).read_text().splitlines()
    hits = [k for k, l in enumerate(t) if needle in l]
    if not hits: raise SystemExit(f'{needle!r} not found in {p}')
    i = hits[-1] if last else hits[0]
    return {'path': rel(p), 'from': i + 1, 'to': i + n, 'lines': t[i:i + n]}

def sentinel(p):  # a step's verdict is its LAST sentinel line
    t = Path(p).read_text().splitlines()
    i = max(k for k, l in enumerate(t) if l.startswith(('AGENT_OK', 'AGENT_FAIL')))
    word, _, body = t[i].partition(' ')
    try: d = json.loads(body)
    except ValueError: return {'path': rel(p), 'from': i + 1, 'to': i + 1, 'lines': t[i:i + 1]}
    # keep the verdict fields only: a failure's traceback carries absolute paths of the build machine
    keep = {k: d[k] for k in ('step', 'postconditions') if d.get(k) is not None}
    if d.get('error'): keep['error'] = {'message': d['error'].get('message')}
    return {'path': rel(p), 'from': i + 1, 'to': i + 1, 'excerpt': True, 'lines': [word + ' ' + json.dumps(keep, ensure_ascii=False)]}

def js(p): return json.loads(Path(p).read_text())

def gate(p):  # form/final gate: failed parts plus each failed part's thinnest wall
    g = js(p)
    walls = {x['id']: round(x['measured'].get('wall_min_mm', 0), 3) for x in g['parts'] if x['id'] in g['failed']}
    return {'path': rel(p), 'value': {'failed': g['failed'], 'parts': len(g['parts']), **({'wall_min_mm': walls} if walls else {})}}

def fit(p):
    f = js(p); s = f['static']
    return {'path': rel(p), 'value': {'status': f['status'], 'candidate_pairs': s['candidate_pairs'],
            'collisions': [{'parts': c['parts'], 'volume_mm3': round(c['volume_mm3'], 4)} for c in s['collisions']]}}

def pick(p, *keys): d = js(p); return {'path': rel(p), 'value': {k: d[k] for k in keys}}

M = B / 'mechanical'
E = {
  # 1 input: the registry pins bytes that never reached this Mac
  'reg_context': grep(B / 'references/source-registry.json', 'verification_context'),
  'reg_rows': lines(B / 'references/source-registry.json', 6, 10),
  'reg_sources': {'path': rel(B / 'references/source-registry.json'), 'value': [{k: x[k] for k in ('id', 'kind', 'sha256', 'local_copy_exists')} for x in js(B / 'references/source-registry.json')['sources']]},
  'reg_disagree': grep(B / 'references/source-registry.json', 'disagree on shell count'),
  'state_generated': grep(B / 'state.md', 'Generated views guide inferred surfaces'),
  # 2 contract
  'params': lines(B / 'design-parameters.json', 3, 9),
  'params_duty': grep(B / 'design-parameters.json', '"duty"'),
  # 3 blockout
  'ok_blockout': sentinel(B / 'runs/blockout-A01/steps/blockout/attempt-0001/stdout.log'),
  # 4 mechanical ladder
  'gate_M02': gate(M / 'M02/shell-gate.json'),
  'gate_M19': gate(M / 'M19/form-gate.json'),
  'fit_M19': fit(M / 'M19/fit-E02.json'),
  'gate_M25': gate(M / 'M25/form-gate.json'),
  'gate_M26': gate(M / 'M26/form-gate.json'),
  'gate_M27': gate(M / 'M27/form-gate.json'),
  'gate_M28': gate(M / 'M28/form-gate.json'),
  'fit_M28': fit(M / 'M28/fit-E02.json'),
  'gate_M29': gate(M / 'M29/form-gate.json'),
  'fit_M29': fit(M / 'M29/fit-E02.json'),
  'freeze_M29': pick(M / 'M29/freeze.json', 'status'),
  # 5 the sentinel trap: a step can finish OK while the gate it feeds fails
  'ok_run_M19': sentinel(M / 'run-M19.log'),
  'fail_fit_M19': sentinel(M / 'M19/fit.log'),
  # 6 controls
  'fail_controls_C01': sentinel(B / 'runs/controls-C01/steps/controls/attempt-0001/stdout.log'),
  'ok_controls_C02': sentinel(B / 'runs/controls-C02/steps/controls/attempt-0001/stdout.log'),
  # 7 electronics
  'erc_a01': grep(B / 'electronics/native-a01/erc.log', 'Failed to load'),
  'erc_a02': grep(B / 'electronics/native-a02/erc.log', 'Found'),
  'erc_a03': grep(B / 'electronics/native-a03/erc.log', 'Found'),
  'erc_a04': grep(B / 'electronics/native-a04/erc.log', 'Found'),
  'drc_a04': grep(B / 'electronics/native-a04/drc.log', 'Found', 3),
  'el_faults': grep(B / 'electronics/README.md', 'The five injected faults'),
  'el_blocked': grep(B / 'electronics/README.md', 'Fabrication and battery operation remain BLOCKED'),
  'ok_electronics': sentinel(B / 'runs/electronics-E02/steps/electronics/attempt-0001/stdout.log'),
  # 8 integration + harness
  'i06_handoff': pick(B / 'integration/engineering/I06/handoff.json', *[k for k in js(B / 'integration/engineering/I06/handoff.json') if 'status' in k or 'fit' in k][:4]),
  'ok_harness': sentinel(B / 'integration/harness/I06-H13-preview.log'),
  'ok_combined': sentinel(B / 'integration/harness/I06-H09-combined.log'),
  'lesson_h12': grep(R / 'docs/native-build-pipeline-lessons.md', 'H12'),
  # 9 print kit
  'gate_P01': gate(B / 'print-kit/P01/final-gate.json'),
  'gate_P03': gate(B / 'print-kit/P03/final-gate.json'),
  'p03_plates': grep(B / 'print-kit/P03/README.md', '| PETG plate', 2),
  'p03_noslicer': grep(B / 'print-kit/P03/README.md', 'No slicer'),
  # 10 presentation
  'lesson_film': grep(R / 'docs/native-build-pipeline-lessons.md', 'D05'),
  # 11 delivery
  'completion': pick(B / 'delivery/completion-R03.json', 'status', 'manufacture', 'physical_samples', 'verified_html_links', 'archive_bytes'),
  'r03_blocked': grep(B / 'delivery/R03/README.md', 'Physical manufacture and battery operation: BLOCKED'),
  'readme_likeness': grep(B / 'README.md', 'Exact likeness is not accepted'),
  # 12 lessons
  'lesson_counts': grep(R / 'docs/native-build-pipeline-lessons.md', 'DC-01: blockout', 3),
  'lesson_i05': grep(R / 'docs/native-build-pipeline-lessons.md', 'I05'),
  'lesson_metal': grep(R / 'docs/native-build-pipeline-lessons.md', 'Metal'),
  'lesson_manifest': grep(R / 'docs/native-build-pipeline-lessons.md', 'pass-05-integration.py'),
}
home = str(Path.home())
bad = [k for k, v in E.items() if home in json.dumps(v)]
assert not bad, f"a local absolute path would appear on screen: {bad}"
out = Path(__file__).with_name('data'); out.mkdir(exist_ok=True)
(out / 'evidence.json').write_text(json.dumps(E, ensure_ascii=False, indent=1))
(out / 'evidence.js').write_text('window.EVIDENCE = ' + json.dumps(E, ensure_ascii=False) + ';\n')  # file:// pages cannot fetch JSON
print(len(E), 'entries')
