// App Controller & View Logic for Physics Figures Suite (Hairline 2:1 Axonometric Standard)
(() => {
  const RULES = ["hit", "order", "reach", "accent", "rest", "honesty", "cost", "clock", "radius", "quiet"];
  const $ = id => document.getElementById(id);
  const navTabs = $("nav-tabs");
  const stage = $("stage");
  const slider = $("intensity");
  const valOut = $("value");
  const nameEl = $("name");
  const readEl = $("read");
  const meansEl = $("means");
  const rulesEl = $("rules");
  const btnPrev = $("btn-prev");
  const btnNext = $("btn-next");

  let currentIndex = 0;
  let currentHandle = null;

  HL.cam = HL.Cam;
  HL._order = PHYSICS_FIGURES.map(f => f.id);
  HL.figures = Object.fromEntries(PHYSICS_FIGURES.map(f => [f.id, f]));

  let picker = $("picker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "picker";
    picker.hidden = true;
    document.body.appendChild(picker);
    PHYSICS_FIGURES.forEach((fig, idx) => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.onclick = () => switchTo(idx);
      picker.appendChild(chip);
    });
  }

  let scrub = $("scrub");
  if (!scrub) {
    scrub = document.createElement("input");
    scrub.id = "scrub";
    scrub.type = "range";
    scrub.min = "0";
    scrub.max = "1";
    scrub.step = "0.01";
    scrub.value = "0.5";
    scrub.hidden = true;
    document.body.appendChild(scrub);
    scrub.addEventListener("input", () => {
      slider.value = scrub.value;
      if (slider.oninput) slider.oninput();
    });
  }

  Object.defineProperty(stage, "children", {
    get() {
      const svg = stage.querySelector("svg");
      return svg ? svg.querySelectorAll("path, polygon, ellipse, circle, line") : [];
    }
  });

  const origSetPC = stage.setPointerCapture;
  const origRelPC = stage.releasePointerCapture;
  if (origSetPC) stage.setPointerCapture = function(id) { try { origSetPC.call(this, id); } catch {} };
  if (origRelPC) stage.releasePointerCapture = function(id) { try { origRelPC.call(this, id); } catch {} };

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) {
      const s = String(v || "rest").trim();
      readEl.textContent = s.length > 28 ? s.slice(0, 28) : s;
    }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    PHYSICS_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex ? " active" : "");
      btn.textContent = (idx + 1) + ". " + fig.id.replace(/^physics-/, "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });
  }

  function switchTo(idx) {
    currentIndex = (idx + PHYSICS_FIGURES.length) % PHYSICS_FIGURES.length;
    renderTabs();

    if (currentHandle) {
      currentHandle.destroy();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = PHYSICS_FIGURES[currentIndex];
    document.title = "Hairline · " + fig.id;
    stage.setAttribute("data-hairline", fig.id);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", fig.means);
    nameEl.textContent = fig.id;
    meansEl.textContent = fig.means;
    rulesEl.textContent = (fig.rules || []).map(n => String(n).padStart(2, "0") + " " + RULES[n - 1]).join(" · ");

    slider.value = "0.5";
    const [lo, mid, hi] = fig.range;
    const at = (i) => Math.round((i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid)) * 1000) / 1000;
    valOut.textContent = String(at(0.5));

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    readEl.textContent = "rest";
    currentHandle = fig.mount({ stage, svg, read: readBridge }, at(0.5));

    slider.oninput = () => {
      const v = at(Number(slider.value));
      valOut.textContent = String(v);
      if (currentHandle && currentHandle.set) currentHandle.set(v);
    };
  }

  if (btnPrev) btnPrev.onclick = () => switchTo(currentIndex - 1);
  if (btnNext) btnNext.onclick = () => switchTo(currentIndex + 1);

  window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowLeft") {
      switchTo(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      switchTo(currentIndex + 1);
    } else {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= PHYSICS_FIGURES.length) {
        switchTo(num - 1);
      }
    }
  });

  window.addEventListener("error", e => {
    const err = $("error");
    if (err) {
      err.hidden = false;
      err.textContent = String((e.error && e.error.message) || e.message);
    }
  });

  renderTabs();
  switchTo(0);
})();
