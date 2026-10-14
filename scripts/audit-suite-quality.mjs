#!/usr/bin/env node
/**
 * Deterministic Static + Live Headless Chrome Quality Gate for all 25 Interactive Figures.
 * Usage:
 *   node scripts/audit-suite-quality.mjs [math|physics|chemistry|pe|all] [--static-only]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_BIN = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = path.resolve(__dirname, "..");

const SUITES = {
  math: {
    dir: path.join(ROOT, "playground/math-figures"),
    html: path.join(ROOT, "playground/math-grade1.html"),
    files: [
      "math-sticks.js",
      "math-balance.js",
      "math-ten-frame.js",
      "math-number-blocks.js",
      "math-number-line.js",
      "math-ruler-pencil.js",
      "math-clock.js",
      "math-shapes.js",
      "math-fraction-pie.js",
      "math-bead-string.js"
    ]
  },
  physics: {
    dir: path.join(ROOT, "playground/physics-figures"),
    html: path.join(ROOT, "playground/physics.html"),
    files: [
      "physics-lever.js",
      "physics-pendulum.js",
      "physics-dynamometer.js",
      "physics-incline.js",
      "physics-switch.js"
    ]
  },
  chemistry: {
    dir: path.join(ROOT, "playground/chemistry-figures"),
    html: path.join(ROOT, "playground/chemistry.html"),
    files: [
      "chemistry-titration.js",
      "chemistry-burner.js",
      "chemistry-lattice.js",
      "chemistry-distillation.js",
      "chemistry-ph-scale.js"
    ]
  },
  pe: {
    dir: path.join(ROOT, "playground/pe-figures"),
    html: path.join(ROOT, "playground/pe.html"),
    files: [
      "pe-stopwatch.js",
      "pe-barbell.js",
      "pe-relay-baton.js",
      "pe-hurdle.js",
      "pe-basketball-hoop.js"
    ]
  }
};

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function checkStaticFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const lines = src.split("\n").length;
  const code = stripComments(src);
  const issues = [];

  if (lines > 200) issues.push(`length(${lines}>200)`);
  if (/Lucas\s+Markes/i.test(src)) issues.push("forbidden_author_ref");

  const paintRules = [
    /\bsetAttribute\s*\(\s*['"](?:fill|stroke|stroke-width|stroke-dasharray|opacity)['"]/,
    /\b(?:fill|stroke|stroke-width|stroke-dasharray|opacity)\s*:\s*['"][^'"]+['"]/,
    /\.style\b/,
    /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(/
  ];
  if (paintRules.some((r) => r.test(code))) issues.push("paint");

  if (/\baddEventListener\s*\(\s*['"](?:click|mousedown|mousemove|pointerdown|pointermove)['"]/.test(code)) {
    issues.push("hit_dom");
  }
  if (/\bsetInterval\s*\(|\bsetTimeout\s*\(|\brequestAnimationFrame\s*\(/.test(code)) {
    issues.push("clock");
  }
  if (/<text\b|mk\s*\(\s*['"]text['"]/.test(code)) {
    issues.push("text");
  }
  if (!/\bHL\.register\s*\(/.test(code)) issues.push("no_register");
  if (!/\bHL\.cam\s*\(/.test(code)) issues.push("no_cam");
  if (!/\bHL\.fit\s*\(/.test(code)) issues.push("no_fit");
  if (!/\bHL\.mk\s*\(/.test(code)) issues.push("no_mk");
  if (!/\bHL\.pointer\s*\(/.test(code)) issues.push("no_pointer");
  if (!/\bread\.textContent\s*=/.test(code)) issues.push("no_readout");
  if (!/\bHL\.unproj\s*\(/.test(code)) issues.push("no_unproj");

  return { lines, issues };
}

async function checkSuiteLive(browser, suiteKey, suiteCfg) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await page.goto("file://" + suiteCfg.html, { waitUntil: "networkidle0" });
  const results = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const chips = [...document.querySelectorAll("#picker .chip")];
    const stage = document.getElementById("stage");
    const scrub = document.getElementById("scrub");
    const out = [];

    function inspectStage() {
      const children = [...stage.children];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let openNoNf = 0;
      let hiCount = 0;
      let circleNoDot = 0;

      for (const el of children) {
        const cls = el.getAttribute("class") || "";
        const tokens = cls.split(/\s+/).filter(Boolean);
        if (tokens.includes("hi")) hiCount++;

        const tag = el.tagName.toLowerCase();
        if (tag === "circle" && !tokens.includes("dot")) {
          circleNoDot++;
        }
        if (tag === "path") {
          const d = (el.getAttribute("d") || "").trim();
          if (d && !/[Zz]\s*$/.test(d) && !tokens.includes("nf")) {
            openNoNf++;
          }
        }
        try {
          const b = el.getBBox();
          if (b.width > 0 || b.height > 0) {
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.width);
            maxY = Math.max(maxY, b.y + b.height);
          }
        } catch {}
      }
      const w = maxX > minX ? maxX - minX : 0;
      const h = maxY > minY ? maxY - minY : 0;
      const cov = (w * h) / (400 * 320);
      const oob = minX < 3 || minY < 3 || maxX > 397 || maxY > 317;
      return {
        minX: Math.round(minX),
        minY: Math.round(minY),
        maxX: Math.round(maxX),
        maxY: Math.round(maxY),
        cov: Number((cov * 100).toFixed(1)),
        oob,
        openNoNf,
        circleNoDot,
        hiCount
      };
    }

    for (let i = 0; i < chips.length; i++) {
      chips[i].click();
      await wait(120);

      const id = window.HL._order[i];
      const fig = window.HL.figures[id];
      const expectedMeans = fig.means;
      const restSnap1 = stage.innerHTML;
      await wait(220);
      const restSnap2 = stage.innerHTML;
      let settled = restSnap1 === restSnap2;
      if (!settled) {
        await wait(900);
        const s3 = stage.innerHTML;
        await wait(180);
        settled = s3 === stage.innerHTML;
      }

      const restMetrics = inspectStage();
      const restRead = document.getElementById("read").textContent.trim();
      const restMeans = document.getElementById("means").textContent.trim();

      // Check scrub = 0 and scrub = 1
      scrub.value = "0";
      scrub.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(120);
      const minMetrics = inspectStage();

      scrub.value = "1";
      scrub.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(120);
      const maxMetrics = inspectStage();

      // Reset scrub = 0.5 and test pointer move + down
      scrub.value = "0.5";
      scrub.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(100);

      const rect = stage.getBoundingClientRect();
      stage.dispatchEvent(new PointerEvent("pointermove", {
        clientX: rect.left + rect.width * 0.45,
        clientY: rect.top + rect.height * 0.48,
        bubbles: true
      }));
      stage.dispatchEvent(new PointerEvent("pointerdown", {
        clientX: rect.left + rect.width * 0.45,
        clientY: rect.top + rect.height * 0.48,
        bubbles: true
      }));
      await wait(120);
      const activeMetrics = inspectStage();
      const activeRead = document.getElementById("read").textContent.trim();
      const activeMeans = document.getElementById("means").textContent.trim();

      stage.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
      await wait(80);

      const issues = [];
      if (!settled) issues.push("infinite_loop_at_rest");
      if (restMeans !== expectedMeans || activeMeans !== expectedMeans) {
        issues.push("means_overwritten");
      }
      if (!restRead || restRead.length > 28) issues.push(`bad_rest_read("${restRead}")`);
      if (!activeRead || activeRead.length > 28) issues.push(`bad_active_read("${activeRead}")`);
      if (restMetrics.openNoNf > 0 || activeMetrics.openNoNf > 0) {
        issues.push(`openNoNf(${Math.max(restMetrics.openNoNf, activeMetrics.openNoNf)})`);
      }
      if (restMetrics.circleNoDot > 0 || activeMetrics.circleNoDot > 0) {
        issues.push(`circleNoDot(${Math.max(restMetrics.circleNoDot, activeMetrics.circleNoDot)})`);
      }
      if (restMetrics.hiCount < 1 || restMetrics.hiCount > 6) {
        issues.push(`hiCount(${restMetrics.hiCount})`);
      }
      if (restMetrics.oob || minMetrics.oob || maxMetrics.oob || activeMetrics.oob) {
        issues.push(`oob(rest:${restMetrics.minX},${restMetrics.minY}..${restMetrics.maxX},${restMetrics.maxY})`);
      }
      if (restMetrics.cov < 24 || restMetrics.cov > 68) {
        issues.push(`coverage(${restMetrics.cov}% outside 24..68%)`);
      }

      out.push({
        id,
        cov: restMetrics.cov,
        bbox: `${restMetrics.minX},${restMetrics.minY}..${restMetrics.maxX},${restMetrics.maxY}`,
        hiCount: restMetrics.hiCount,
        openNoNf: restMetrics.openNoNf,
        restRead,
        activeRead,
        issues
      });
    }
    return out;
  });

  await page.close();
  return { pageErrors, results };
}

async function main() {
  const args = process.argv.slice(2);
  const targetArg = args.find((a) => !a.startsWith("--")) || "all";
  const staticOnly = args.includes("--static-only");

  const suiteKeys = targetArg === "all" ? Object.keys(SUITES) : [targetArg];
  let totalFailures = 0;

  for (const key of suiteKeys) {
    const cfg = SUITES[key];
    if (!cfg) {
      console.error(`Unknown suite: ${key}`);
      process.exit(1);
    }
    console.log(`\n=== STATIC AUDIT: ${key.toUpperCase()} ===`);
    for (const f of cfg.files) {
      const fp = path.join(cfg.dir, f);
      const { lines, issues } = checkStaticFile(fp);
      const status = issues.length === 0 ? "PASS" : "FAIL";
      if (issues.length > 0) totalFailures++;
      console.log(`  [${status}] ${f.padEnd(30)} ${String(lines).padStart(3)}L  ${issues.join(", ") || "ok"}`);
    }
  }

  if (!staticOnly) {
    // Loaded only for the live audit so --static-only runs without a browser dependency.
    const { default: puppeteer } = await import("puppeteer-core");
    const browser = await puppeteer.launch({ headless: true, executablePath: CHROME_BIN });
    try {
      for (const key of suiteKeys) {
        const cfg = SUITES[key];
        console.log(`\n=== LIVE CHROME AUDIT: ${key.toUpperCase()} ===`);
        const { pageErrors, results } = await checkSuiteLive(browser, key, cfg);
        if (pageErrors.length > 0) {
          totalFailures += pageErrors.length;
          console.log(`  [FAIL] Page errors: ${pageErrors.join("; ")}`);
        }
        for (const r of results) {
          const status = r.issues.length === 0 ? "PASS" : "FAIL";
          if (r.issues.length > 0) totalFailures++;
          console.log(
            `  [${status}] ${r.id.padEnd(28)} cov:${String(r.cov).padStart(4)}% hi:${r.hiCount} bbox:[${r.bbox}] read:"${r.restRead}" -> "${r.activeRead}" ${r.issues.join(", ")}`
          );
        }
      }
    } finally {
      await browser.close();
    }
  }

  if (totalFailures > 0) {
    console.error(`\nAUDIT FAILED: ${totalFailures} item(s) need attention.`);
    process.exit(1);
  } else {
    console.log(`\nAUDIT PASSED: All checked figures meet 100% static + live Chrome gates.`);
  }
}

main();
