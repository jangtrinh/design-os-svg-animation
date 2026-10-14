// Line-end gate for Hairline suite pages, driven by the vendored anatomy line check.
// Every texture line (stroke tone .lo/.hi that is not a solid's silhouette or crease) must end
// on another stroke, a dot or an outline. Hairline markup is tagged with anatomy's `iso-line`
// class in the page before the check runs, so the vendored scripts stay unmodified.
// Solid creases are skipped like anatomy's iso-crease.
//
//   node scripts/check-hairline-line-ends.mjs [suite...] [--out dir] [--tolerance 1]
//   suites: math-grade1 physics chemistry pe (default: all)
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const drive = join(root, "vendor/anatomy/scripts/drive.mjs");
const SUITES = { "math-grade1": 10, physics: 5, chemistry: 5, pe: 5 };

const argv = process.argv.slice(2);
const take = (flag, fallback) => {
  const at = argv.indexOf(flag);
  if (at < 0) return fallback;
  return argv.splice(at, 2)[1];
};
const outDir = take("--out", null);
const tolerance = Number(take("--tolerance", 1));
const suites = argv.length ? argv : Object.keys(SUITES);

// Runs in the page: show figure `idx` through the runner's own picker, then tag texture lines.
const prepare = (idx) => `(() => {
  const chips = document.querySelectorAll("#nav-tabs button");
  if (!chips[${idx}]) throw new Error("no figure tab ${idx}");
  chips[${idx}].click();
  const stage = document.getElementById("stage");
  let tagged = 0;
  stage.querySelectorAll("path, line, polyline").forEach((el) => {
    const c = el.classList;
    // solid() emits its crease as the "nf lo" path right after the silhouette: kit outline, not texture
    const isCrease = el.previousElementSibling?.classList.contains("sil");
    if ((c.contains("lo") || c.contains("hi")) && !c.contains("sil") && !isCrease) {
      // pin the computed stroke: a page that inlines the kit's ISO_CSS restyles .iso-line with
      // --anatomy-* vars that only exist inside an .iso wrapper, which would hide the line from the check
      const style = getComputedStyle(el);
      el.style.stroke = style.stroke;
      el.style.strokeWidth = style.strokeWidth;
      el.style.strokeOpacity = style.strokeOpacity;
      c.add("iso-line");
      tagged++;
    }
  });
  return document.title + " · " + tagged + " texture lines";
})()`;

let failures = 0;
const summary = [];
for (const suite of suites) {
  const count = SUITES[suite];
  if (!count) throw new Error(`unknown suite ${suite}; expected one of ${Object.keys(SUITES).join(", ")}`);
  const page = join(root, "playground", `${suite}.html`);
  readFileSync(page); // fail early on a missing page
  for (let idx = 0; idx < count; idx++) {
    const shot = outDir ? join(outDir, `${suite}-${idx + 1}-line-ends.png`) : null;
    if (shot) mkdirSync(outDir, { recursive: true });
    const actions = [["wait", 800], ["eval", prepare(idx)], ["wait", 1200], ["lines", shot, "#stage", { tolerance }]];
    const run = spawnSync(process.execPath, [drive, page, JSON.stringify(actions)], { encoding: "utf8" });
    const text = `${run.stdout}${run.stderr}`;
    const verdict = text.match(/line ends: .*/)?.[0] ?? "line ends: check did not run";
    summary.push(`${suite} #${idx + 1}  ${verdict}`);
    if (run.status !== 0) {
      failures++;
      console.log(text.trim());
    }
  }
}
console.log(summary.join("\n"));
console.log(failures ? `line-end gate failed: ${failures} figure(s)` : "line-end gate passed");
process.exit(failures ? 1 : 0);
