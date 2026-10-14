/*
 * 4. Olympic Track Hurdle (Rào Điền Kinh Bật Nhảy)
 * Physical Concept: 5 mức chiều cao chuẩn World Athletics (76.2cm – 106.7cm) · Lực lật an toàn F ≥ 36 N.
 */

export default {
  id: "pe-hurdle",
  title: "4. Rào Điền Kinh (Olympic Track Hurdle)",
  concept: "Quy chuẩn rào điền kinh WA: Chiều cao 76.2cm - 106.7cm · Cơ chế lật an toàn F ≥ 36 N",
  means: "Di chuột dọc nâng hạ chiều cao rào theo các cự ly thi đấu (100m nữ, 400m rào, 110m nam). Ống lồng cơ học nâng thanh xà rào lên chuẩn xác với dao động nhún đàn hồi.",
  rules: [1, 2, 4, 6, 9],
  range: [76.2, 91.4, 106.7],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.1);
    HL.fit(C, [[-45, -16, 0], [45, 16, 32]], 200, 168);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Running Track Platform (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. Dual L-shaped Feet & Cross Brace
    const footSolL = HL.solid(svg), footSolR = HL.solid(svg);
    const [ftLO, ftLI] = HL.rings(-20, -10, -16, 8, 0.8, 0.3);
    const [ftRO, ftRI] = HL.rings(16, -10, 20, 8, 0.8, 0.3);
    HL.put(footSolL, HL.prism(P, front, ftLO, ftLI, 2.5, 4.5));
    HL.put(footSolR, HL.prism(P, front, ftRO, ftRI, 2.5, 4.5));

    const braceSol = HL.solid(svg);
    const [brO, brI] = HL.rings(-16, -7.0, 16, -5.0, 0.5, 0.2);
    HL.put(braceSol, HL.prism(P, front, brO, brI, 2.8, 4.5));

    // 3. Fixed Outer Upright Columns & WA Height Graduation Ticks
    const postSolL = HL.solid(svg), postSolR = HL.solid(svg);
    const [pLO, pLI] = HL.rings(-19.5, -1.5, -16.5, 1.5, 0.5, 0.2);
    const [pRO, pRI] = HL.rings(16.5, -1.5, 19.5, 1.5, 0.5, 0.2);
    HL.put(postSolL, HL.prism(P, front, pLO, pLI, 4.5, 15.5));
    HL.put(postSolR, HL.prism(P, front, pRO, pRI, 4.5, 15.5));

    let tickD = "";
    for (let i = 0; i < 5; i++) {
      const tz = 18.0 + i * 2.5;
      tickD += HL.seg(P(-21.2, 0, tz), P(-19.6, 0, tz)) + HL.seg(P(19.6, 0, tz), P(21.2, 0, tz));
    }
    const heightTickPath = HL.mk("path", { d: tickD, class: "nf lo" }, svg);

    const kL = P(-20.5, 0, 14.5), kR = P(20.5, 0, 14.5);
    HL.mk("circle", { cx: HL.r2(kL[0]), cy: HL.r2(kL[1]), r: 1.5, class: "dot m" }, svg);
    HL.mk("circle", { cx: HL.r2(kR[0]), cy: HL.r2(kR[1]), r: 1.5, class: "dot m" }, svg);

    // 4. Telescopic Inner Tubes, Top Hurdle Board, Zebra Stripes & Clearance Arc
    const innerTubesSol = HL.solid(svg);
    const boardSol = HL.solid(svg);
    const stripeL = HL.mk("path", { class: "hi" }, svg);
    const stripeR = HL.mk("path", { class: "hi" }, svg);
    const trajectoryPath = HL.mk("path", { class: "nf dash" }, svg);

    const initialH = initialV != null ? initialV : 91.4;
    const spH = HL.spring(initialH, { k: 120, c: 14 });
    let lastKey = "";

    function draw() {
      const hCm = spH.x;
      const key = `${HL.r2(hCm)}`;
      if (key === lastKey) return;
      lastKey = key;

      const curZ = 18.0 + ((hCm - 76.2) / (106.7 - 76.2)) * 10.0;
      const boardH = 3.6, boardW = 0.8;

      const [inLO, inLI] = HL.rings(-19.0, -1.0, -17.0, 1.0, 0.4, 0.2);
      const [inRO, inRI] = HL.rings(17.0, -1.0, 19.0, 1.0, 0.4, 0.2);
      const pL_b = HL.prism(P, front, inLO, inLI, 14.0, curZ);
      const pR_b = HL.prism(P, front, inRO, inRI, 14.0, curZ);
      HL.put(innerTubesSol, { sil: pL_b.sil + " " + pR_b.sil, crease: pL_b.crease + " " + pR_b.crease });

      const [bO, bI] = HL.rings(-22, -boardW, 22, boardW, 0.3, 0.15);
      HL.put(boardSol, HL.prism(P, front, bO, bI, curZ, curZ + boardH));

      const sL = [P(-14, boardW + 0.1, curZ), P(-8, boardW + 0.1, curZ), P(-8, boardW + 0.1, curZ + boardH), P(-14, boardW + 0.1, curZ + boardH)];
      const sR = [P(8, boardW + 0.1, curZ), P(14, boardW + 0.1, curZ), P(14, boardW + 0.1, curZ + boardH), P(8, boardW + 0.1, curZ + boardH)];
      stripeL.setAttribute("d", HL.poly(sL));
      stripeR.setAttribute("d", HL.poly(sR));

      const arcPts = [];
      for (let y = -12; y <= 12; y += 2) {
        const zArc = curZ + boardH + 2.8 - (y * y) * 0.06;
        arcPts.push(P(0, y, zArc));
      }
      trajectoryPath.setAttribute("d", HL.open(arcPts));
      heightTickPath.classList.toggle("hi", hCm >= 105.0);
      boardSol.sil.classList.toggle("hi", hCm >= 105.0);

      const ev = hCm <= 78 ? "400mW" : hCm <= 86 ? "100mW" : hCm <= 95 ? "400mM" : "110mM";
      read.textContent = `h=${HL.r2(hCm)}cm (${ev}) · F≥36N`;
    }

    function setHurdle(val) {
      spH.t = HL.clamp(val, 76.2, 106.7);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setHurdle(91.4); return; }
      const [, wy] = HL.unproj(C, pt[0], pt[1], 20.0);
      const norm = HL.clamp(1.0 - (pt[1] - 40 + wy * 0.1) / 220, 0, 1);
      setHurdle(76.2 + norm * (106.7 - 76.2));
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spH, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return {
      set(v) { setHurdle(Number(v)); },
      destroy: bag.dispose
    };
  }
};
