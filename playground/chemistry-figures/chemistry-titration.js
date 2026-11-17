/*
 * 1. Acid-Base Titration & Buret (Chuẩn Độ Axit - Bazơ & Buret Chuẩn Xác)
 * HCl 0.10 M (20.0 mL) titrated with NaOH 0.10 M (0..25 mL); equivalence at 20.0 mL (pH 7.00).
 */

export default {
  id: "chemistry-titration",
  title: "1. Chuẩn Độ Axit - Bazơ (Acid-Base Titration)",
  concept: "Phản ứng HCl + NaOH → NaCl + H₂O · Bước nhảy pH tại 20.0 mL · Chỉ thị Phenolphthalein pH 8.2",
  means: "Di chuột điều chỉnh khóa buret xả dung dịch NaOH (0 đến 25 mL). Tại đúng 20.0 mL (điểm tương đương), bước nhảy pH kích hoạt phenolphtalein chuyển hồng tức thì.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 10, 25],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.35);
    HL.fit(C, [[-16, -16, 0], [18, 14, 42]], 204, 162);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 24) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Heavy Cast-Iron Retort Stand Base & White Ceramic Tile
    const standSol = HL.solid(svg);
    const [stO, stI] = HL.rings(-14, -15, 16, 12, 2.0, 0.6);
    HL.put(standSol, HL.prism(P, front, stO, stI, 0, 2.4));

    const [tileO, tileI] = HL.rings(-8.5, -5.5, 8.5, 8.5, 1.0, 0.4);
    const tileSol = HL.solid(svg);
    HL.put(tileSol, HL.prism(P, front, tileO, tileI, 2.4, 3.0));

    // Vertical Stand Rod offset cleanly to screen-left (u = 5.5, v = -11.0 => v - u = -16.5)
    const rodX = 5.5, rodY = -11.0;
    const rodSol = HL.solid(svg);
    HL.put(rodSol, HL.prism(P, front, circAt(rodX, rodY, 1.15, 16), circAt(rodX, rodY, 0.8, 16), 2.4, 41.0));

    const bossSol = HL.solid(svg);
    const [bshO, bshI] = HL.rings(rodX - 1.6, rodY - 1.6, rodX + 1.6, rodY + 1.6, 0.5, 0.25);
    HL.put(bossSol, HL.prism(P, front, bshO, bshI, 26.2, 28.6));

    // Horizontal clamp beam reaching from stand rod (5.5, -11.0) to buret (0, 0)
    const arm0 = P(rodX, rodY, 27.4), arm1 = P(0, 0, 27.4);
    const armTop0 = P(rodX, rodY, 28.2), armTop1 = P(0, 0, 28.2);
    HL.mk("path", { class: "sil", d: HL.poly([arm0, arm1, armTop1, armTop0]) }, svg);

    // 2. 3D Erlenmeyer Flask (Conical Frustum Body + Liquid Hull + Cylindrical Neck)
    const fX = 0, fY = 1.5, fBaseR = 7.2, fNeckR = 2.4;
    const fBaseRing = circAt(fX, fY, fBaseR, 28);
    const fNeckRing = circAt(fX, fY, fNeckR, 24);
    const flaskSol = HL.solid(svg);
    const bPts = HL.ringAt(P, fBaseRing, 3.0);
    const sPts = HL.ringAt(P, fNeckRing, 9.6);
    HL.put(flaskSol, { sil: HL.poly(HL.hull([...bPts, ...sPts])), crease: HL.poly(bPts) + HL.poly(sPts) });

    const flaskLiquid = HL.mk("path", { class: "lo" }, svg);
    const flaskMeniscus = HL.mk("path", { class: "lo" }, svg);

    const flaskNeckSol = HL.solid(svg);
    HL.put(flaskNeckSol, HL.prism(P, front, fNeckRing, circAt(fX, fY, fNeckR - 0.4, 24), 9.6, 12.8));

    const lipSol = HL.solid(svg);
    HL.put(lipSol, HL.prism(P, front, circAt(fX, fY, fNeckR + 0.45, 24), fNeckRing, 12.4, 13.0));

    // 3. Glass Buret & Graduations
    const buretR = 1.75;
    const buretSol = HL.solid(svg);
    HL.put(buretSol, HL.prism(P, front, circAt(0, 0, buretR, 20), circAt(0, 0, buretR - 0.35, 20), 16.0, 40.8));

    let tickD = "";
    for (let gz = 18.5; gz <= 39.5; gz += 1.5) {
      const isMaj = Math.round((gz - 18.5) * 10) % 30 === 0;
      const len = isMaj ? 1.3 : 0.75;
      tickD += HL.seg(P(-buretR * 0.6, buretR * 0.8, gz), P((-buretR + len) * 0.6, (buretR - len) * 0.8, gz));
    }
    HL.mk("path", { class: "nf lo", d: tickD }, svg);

    // 4. Front Clamp Finger (drawn AFTER buret for proper Painter's Order occlusion)
    const fingerFrontSol = HL.solid(svg);
    const [ffO, ffI] = HL.rings(-2.2, -0.6, 2.2, 2.3, 0.6, 0.25);
    HL.put(fingerFrontSol, HL.prism(P, front, ffO, ffI, 26.6, 28.2));

    // 5. Stopcock Valve, PTFE Handle & Tip
    const scHousingSol = HL.solid(svg);
    HL.put(scHousingSol, HL.prism(P, front, circAt(0, 0, 2.3, 16), circAt(0, 0, 1.8, 16), 15.0, 16.3));
    const stopcockHandle = HL.mk("path", { class: "nf hi" }, svg);
    // the handle ends on a dot at each tip so neither end floats
    const handleTips = [0, 1].map(() => HL.mk("circle", { r: 1.6, class: "dot m" }, svg));

    const tipSol = HL.solid(svg);
    HL.put(tipSol, HL.prism(P, front, circAt(0, 0, 0.85, 14), circAt(0, 0, 0.5, 14), 13.4, 15.0));

    const buretMeniscus = HL.mk("path", { class: "lo" }, svg);
    const droplet = HL.mk("path", { class: "nf hi" }, svg);

    const spVol = HL.spring(initialV != null ? initialV : 10.0, { k: 120, c: 15 });
    let lastKey = "";

    function computePH(v) {
      if (v < 20.0) return Math.max(1.0, -Math.log10((2.0 - 0.1 * v) / (20.0 + v)));
      if (Math.abs(v - 20.0) < 1e-4) return 7.0;
      return Math.min(13.0, 14.0 + Math.log10((0.1 * (v - 20.0)) / (20.0 + v)));
    }

    function draw() {
      const vol = spVol.x;
      const vel = Math.abs(spVol.v);
      const key = `${HL.r2(vol)}:${HL.r2(vel)}`;
      if (key === lastKey) return;
      lastKey = key;

      const pH = computePH(vol);
      const isEndpoint = pH >= 8.2;

      const flow = HL.clamp(vel * 0.15 + (vol > 0 ? 0.35 : 0), 0, 1);
      const ang = flow * (Math.PI / 2);
      const scLen = 3.8;
      const tipA = P(-scLen * Math.cos(ang), 1.2, 15.65 + scLen * Math.sin(ang));
      const tipB = P(scLen * Math.cos(ang), 1.2, 15.65 - scLen * Math.sin(ang));
      stopcockHandle.setAttribute("d", HL.seg(tipA, tipB));
      HL.place(handleTips[0], tipA);
      HL.place(handleTips[1], tipB);

      const menZ = 39.2 - (vol / 25.0) * 19.5;
      buretMeniscus.setAttribute("d", HL.poly(HL.ringAt(P, circAt(0, 0, buretR - 0.25, 18), menZ)));

      const liqZ = 4.4 + (vol / 25.0) * 2.6;
      const liqR = fBaseR - 0.35 - ((liqZ - 3.0) / (9.6 - 3.0)) * (fBaseR - fNeckR);
      const lBase = HL.ringAt(P, circAt(fX, fY, fBaseR - 0.35, 22), 3.15);
      const lTop = HL.ringAt(P, circAt(fX, fY, liqR, 22), liqZ);
      flaskLiquid.setAttribute("d", HL.poly(HL.hull([...lBase, ...lTop])));
      flaskMeniscus.setAttribute("d", HL.poly(lTop));

      const dropPhase = (vel > 0.05 || (vol > 0.2 && vol < 24.8)) ? ((vol * 2.5) % 1) : 0;
      const dropZ = 13.2 - dropPhase * (13.2 - liqZ - 0.8);
      const dpTop = P(0, fY * 0.4, dropZ + 0.7);
      const dpBot = P(0, fY * 0.4, dropZ - 0.5);
      droplet.setAttribute("d", HL.seg(dpTop, dpBot));

      flaskLiquid.classList.toggle("hi", isEndpoint);
      flaskMeniscus.classList.toggle("hi", isEndpoint);
      read.textContent = isEndpoint
        ? `V=${vol.toFixed(1)}mL · pH ${pH.toFixed(2)} [HỒNG]`
        : `V=${vol.toFixed(1)}mL · pH ${pH.toFixed(2)} [AXIT]`;
    }

    function setVol(val) {
      spVol.t = HL.clamp(val, 0, 25);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setVol(10.0); return; }
      const w = HL.unproj(C, pt[0], pt[1], 15.0);
      const norm = HL.clamp((w[0] - w[1] + 22) / 44, 0, 1);
      setVol(norm * 25.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spVol, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setVol(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
};
