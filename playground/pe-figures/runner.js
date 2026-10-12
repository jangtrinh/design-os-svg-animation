// App Controller & View Logic for Physical Education Figures Suite
(() => {
  const $ = id => document.getElementById(id);
  const navTabs = $("nav-tabs");
  const stage = $("stage");
  const slider = $("intensity");
  const valOut = $("value");
  const nameEl = $("name");
  const readEl = $("read");
  const metaTitle = $("meta-title");
  const metaDesc = $("meta-desc");
  const metaRule = $("meta-rule");
  const singleView = $("single-view");
  const galleryView = $("gallery-view");

  let currentIndex = 0;
  let currentHandle = null;
  let isGalleryMode = false;

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) { readEl.textContent = v; }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    PE_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex && !isGalleryMode ? " active" : "");
      btn.textContent = fig.title.split(" (")[0];
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
    });

    const galleryBtn = document.createElement("button");
    galleryBtn.className = "nav-btn view-mode-toggle" + (isGalleryMode ? " active" : "");
    galleryBtn.textContent = isGalleryMode ? "Tập Trung (Focus)" : "Xem Cả 5 Hình (Gallery)";
    galleryBtn.onclick = toggleGalleryMode;
    navTabs.appendChild(galleryBtn);
  }

  function switchTo(idx) {
    isGalleryMode = false;
    galleryView.hidden = true;
    singleView.hidden = false;
    currentIndex = idx;
    renderTabs();

    if (currentHandle) {
      if (currentHandle.destroy) currentHandle.destroy();
      else if (currentHandle.dispose) currentHandle.dispose();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = PE_FIGURES[idx];
    stage.setAttribute("data-hairline", fig.id);
    nameEl.textContent = fig.id;
    metaTitle.textContent = fig.title;
    metaDesc.textContent = fig.means;
    metaRule.textContent = "Khái niệm thể thao: " + fig.concept + " · Tiêu chuẩn: Hairline 2:1 Axonometric";

    slider.min = fig.range[0];
    slider.max = fig.range[2];
    slider.value = fig.range[1];
    valOut.textContent = String(fig.range[1]);

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    currentHandle = fig.mount({ stage, svg, read: readBridge }, fig.range[1]);
  }

  function toggleGalleryMode() {
    isGalleryMode = !isGalleryMode;
    if (isGalleryMode) {
      if (currentHandle) {
        if (currentHandle.destroy) currentHandle.destroy();
        else if (currentHandle.dispose) currentHandle.dispose();
        currentHandle = null;
      }
      singleView.hidden = true;
      galleryView.hidden = false;
      renderTabs();
      buildGallery();
    } else {
      switchTo(currentIndex);
    }
  }

  function buildGallery() {
    galleryView.innerHTML = "";
    PE_FIGURES.forEach((fig, idx) => {
      const card = document.createElement("div");
      card.className = "grid-card";
      
      const gStage = document.createElement("div");
      gStage.className = "grid-stage";
      gStage.id = "gstage-" + idx;
      gStage.setAttribute("data-hairline", fig.id);

      const gMeta = document.createElement("div");
      gMeta.className = "grid-meta";
      
      const gName = document.createElement("div");
      gName.className = "grid-name";
      gName.textContent = fig.title;

      const gDesc = document.createElement("div");
      gDesc.className = "grid-desc";
      gDesc.textContent = fig.concept;

      const gRead = document.createElement("div");
      gRead.className = "grid-read";

      gMeta.appendChild(gName);
      gMeta.appendChild(gDesc);
      gMeta.appendChild(gRead);

      card.appendChild(gStage);
      card.appendChild(gMeta);
      card.onclick = () => switchTo(idx);
      galleryView.appendChild(card);

      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, gStage);
      const readObj = {
        get textContent() { return gRead.textContent; },
        set textContent(v) { gRead.textContent = v; }
      };
      fig.mount({ stage: gStage, svg, read: readObj }, fig.range[1]);
    });
  }

  slider.oninput = e => {
    const val = Number(e.target.value);
    valOut.textContent = String(val);
    if (currentHandle && currentHandle.set) {
      currentHandle.set(val);
    }
  };

  window.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= PE_FIGURES.length) {
      switchTo(num - 1);
    } else if (e.key === "g" || e.key === "G") {
      toggleGalleryMode();
    }
  });

  // Initial boot
  renderTabs();
  switchTo(0);
})();
