/*
 * 5. Basketball Breakaway Rim & Trajectory (Vành Rổ FIBA 3D Isometric & Quỹ Đạo Parabol)
 * Physical Concept: Cơ chế vành rổ đàn hồi FIBA (F ≥ 805 N) · Quỹ đạo parabol.
 */
export default {
  id: "pe-basketball-hoop",
  title: "5. Vành Rổ & Đàn Hồi (FIBA Breakaway Rim)",
  concept: "Cơ chế vành rổ giảm chấn FIBA · Ngưỡng nhả lò xo F ≥ 805 N · Quỹ đạo parabol",
  means: "Di chuột điều khiển quỹ đạo ném bóng (0% - 100%). Click vào vành rổ để thử tải slam-dunk 950 N gập vành rổ.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 50, 100],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.3);
    HL.fit(C, [[-26, -26, 0], [22, 16, 40]], 204, 166);
    const P = HL.proj(C), front = HL.facing(C);

    let courtD = HL.seg(P(-26, -12, 0.1), P(22, -12, 0.1));
    const keyArcPts = [];
    // The key arc starts exactly where it crosses the baseline (y=-12) so it lands on that stroke.
    const arcA0 = Math.asin(-12 / 15), arcA1 = (115 * Math.PI) / 180;
    for (let i = 0; i <= 12; i++) {
      const rad = arcA0 + ((arcA1 - arcA0) * i) / 12;
      keyArcPts.push(P(15 * Math.cos(rad), 15 * Math.sin(rad), 0.1));
    }
    courtD += HL.open(keyArcPts);
    HL.mk("path", { d: courtD, class: "nf lo" }, svg);
    // Court markings that stop in open floor end on terminal dots.
    for (const [x, y] of [[-26, -12], [22, -12], [15 * Math.cos(arcA1), 15 * Math.sin(arcA1)]]) {
      const pd = P(x, y, 0.1);
      HL.mk("circle", { cx: HL.r2(pd[0]), cy: HL.r2(pd[1]), r: 1.1, class: "dot m" }, svg);
    }

    const [stO, stI] = HL.rings(-10, -26, 10, -18, 2.0, 0.8);
    const stSol = HL.solid(svg);
    HL.put(stSol, HL.prism(P, front, stO, stI, 0, 10));

    const [padO, padI] = HL.rings(-8.5, -18, 8.5, -14.5, 1.2, 0.5);
    const padSol = HL.solid(svg);
    HL.put(padSol, HL.prism(P, front, padO, padI, 0, 12));

    const [strutLO, strutLI] = HL.rings(-6.5, -16.0, -4.0, -11.0, 0.8, 0.3);
    const strutLSol = HL.solid(svg);
    HL.put(strutLSol, HL.prism(P, front, strutLO, strutLI, 11, 24));

    const [strutRO, strutRI] = HL.rings(4.0, -16.0, 6.5, -11.0, 0.8, 0.3);
    const strutRSol = HL.solid(svg);
    HL.put(strutRSol, HL.prism(P, front, strutRO, strutRI, 11, 24));

    const [boardO, boardI] = HL.rings(-17, -11.5, 17, -10.0, 1.0, 0.4);
    const boardSol = HL.solid(svg);
    HL.put(boardSol, HL.prism(P, front, boardO, boardI, 20, 35));

    const boxPts = [P(-5.5, -9.9, 22.5), P(5.5, -9.9, 22.5), P(5.5, -9.9, 28.5), P(-5.5, -9.9, 28.5)];
    HL.mk("path", { d: HL.poly(boxPts), class: "nf hi" }, svg);

    const [bracketO, bracketI] = HL.rings(-2.5, -10.0, 2.5, -7.0, 0.6, 0.3);
    const bracketSol = HL.solid(svg);
    HL.put(bracketSol, HL.prism(P, front, bracketO, bracketI, 22.5, 24.5));

    const yHinge = -7.0, zHinge = 23.6, xCenter = 0, yCenter = 0.5;
    const rimRadiusOut = 7.0, rimRadiusIn = 5.8, netHangLen = 11.0;

    const arcPath = HL.mk("path", { class: "nf dash" }, svg);
    const backNetPath = HL.mk("path", { class: "nf lo" }, svg);
    const rearRimPath = HL.mk("path", { class: "hi" }, svg);
    // Use <ellipse> so kernel CSS fills basketball with warm plate (--hl-plate) instead of solid black
    const ballR = 11.5;
    const ballBody = HL.mk("ellipse", { rx: ballR, ry: ballR, class: "sil" }, svg);
    const ballSeamsPath = HL.mk("path", { class: "nf lo" }, svg);
    const frontNetPath = HL.mk("path", { class: "nf lo" }, svg);
    const frontRimPath = HL.mk("path", { class: "hi" }, svg);

    function ballPosAt(normT) {
      if (normT <= 0.74) {
        const s = normT / 0.74;
        return [-20 + s * 20, 14 + s * (yCenter - 14), (1 - s) * (1 - s) * 14.0 + 2 * (1 - s) * s * 46.0 + s * s * 24.2];
      }
      const s = (normT - 0.74) / 0.26;
      return [xCenter + Math.sin(s * Math.PI) * 0.4, yCenter, 24.2 - s * 20.0];
    }

    const guidePts = [];
    for (let i = 0; i <= 20; i++) guidePts.push(P(...ballPosAt((i / 20) * 0.74)));
    arcPath.setAttribute("d", HL.open(guidePts));

    const initialT = initialV != null ? initialV : 50;
    const spT = HL.spring(initialT, { k: 110, c: 14 });
    const spDeflect = HL.spring(0, { k: 240, c: 16 });
    const spNetFlutter = HL.spring(0, { k: 180, c: 14 });
    let dunkHoldTimer = 0, lastKey = "";

    function getDeflectedPoint(x, y, z, thetaRad) {
      const dy = y - yHinge, dz = z - zHinge;
      return P(x, yHinge + dy * Math.cos(thetaRad) + dz * Math.sin(thetaRad), zHinge - dy * Math.sin(thetaRad) + dz * Math.cos(thetaRad));
    }

    function draw() {
      const normT = HL.clamp(spT.x, 0, 100) / 100, defX = spDeflect.x, flutX = spNetFlutter.x;
      const key = `${HL.r2(normT * 100)}:${HL.r2(defX)}:${HL.r2(flutX)}`;
      if (key === lastKey) return;
      lastKey = key;

      const [bX, bY, bZ] = ballPosAt(normT);
      const ballP = P(bX, bY, bZ), bx = HL.r2(ballP[0]), by = HL.r2(ballP[1]), rP = ballR;
      HL.place(ballBody, ballP);
      ballSeamsPath.setAttribute(
        "d",
        `M${HL.r2(bx - rP)} ${by}Q${bx} ${HL.r2(by - rP * 0.55)} ${HL.r2(bx + rP)} ${by}` +
        `M${bx} ${HL.r2(by - rP)}Q${HL.r2(bx + rP * 0.55)} ${by} ${bx} ${HL.r2(by + rP)}` +
        `M${HL.r2(bx - rP * 0.7)} ${HL.r2(by - rP * 0.7)}Q${bx} ${by} ${HL.r2(bx - rP * 0.7)} ${HL.r2(by + rP * 0.7)}`
      );

      const isSwish = normT >= 0.72 && normT <= 0.84;
      if (isSwish) {
        const imp = Math.sin(((normT - 0.72) / 0.12) * Math.PI);
        spDeflect.t = imp * 8.5; spNetFlutter.t = imp * 3.8;
      } else if (dunkHoldTimer <= 0) {
        spDeflect.t = 0; spNetFlutter.t = 0;
      }

      const theta = (defX * Math.PI) / 180, N = 28, ptsOut = [], ptsIn = [];
      for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2;
        ptsOut.push(getDeflectedPoint(xCenter + rimRadiusOut * Math.cos(ang), yCenter + rimRadiusOut * Math.sin(ang), zHinge, theta));
        ptsIn.push(getDeflectedPoint(xCenter + rimRadiusIn * Math.cos(ang), yCenter + rimRadiusIn * Math.sin(ang), zHinge, theta));
      }
      const half = N / 2;
      frontRimPath.setAttribute("d", HL.poly([...ptsOut.slice(0, half + 1), ...ptsIn.slice(0, half + 1).reverse()]));
      rearRimPath.setAttribute("d", HL.poly([...ptsOut.slice(half).concat([ptsOut[0]]), ...[ptsIn[0]].concat(ptsIn.slice(half).reverse())]));

      const numLoops = 12;
      const tiers = [
        { z: zHinge, r: (rimRadiusOut + rimRadiusIn) / 2, rot: 0 },
        { z: zHinge - 3.2, r: 5.2 + flutX * 0.6, rot: Math.PI / numLoops },
        { z: zHinge - 6.8, r: 4.2 + flutX * 1.2, rot: 0 },
        { z: zHinge - netHangLen, r: 3.4 + flutX * 1.6, rot: Math.PI / numLoops }
      ];
      const tierPts = tiers.map(t => Array.from({ length: numLoops }, (_, k) => {
        const ang = (k / numLoops) * Math.PI * 2 + t.rot;
        const x = xCenter + t.r * Math.cos(ang), y = yCenter + t.r * Math.sin(ang);
        return { p: getDeflectedPoint(x, y, t.z, theta), yMid: y };
      }));

      let fNet = "", bNet = "";
      for (let tIdx = 0; tIdx < 3; tIdx++) {
        for (let k = 0; k < numLoops; k++) {
          const p0 = tierPts[tIdx][k];
          for (const p1 of [tierPts[tIdx + 1][k], tierPts[tIdx + 1][(k + 1) % numLoops]]) {
            const s = HL.seg(p0.p, p1.p);
            if ((p0.yMid + p1.yMid) / 2 >= yCenter) fNet += s; else bNet += s;
          }
        }
      }
      frontNetPath.setAttribute("d", fNet);
      backNetPath.setAttribute("d", bNet);

      const curForce = Math.max(0, defX * 58.5);
      if (isSwish) read.textContent = `SWISH · F=${curForce.toFixed(0)}N · -${defX.toFixed(1)}°`;
      else if (defX >= 3.0) read.textContent = `DUNK · F=${curForce.toFixed(0)}N · -${defX.toFixed(1)}°`;
      else read.textContent = `Shot ${(normT * 100).toFixed(0)}% · z=${bZ.toFixed(1)}`;
    }

    function setShot(val) { spT.t = HL.clamp(val, 0, 100); reg.wake(); }
    function aim(pt) {
      if (!pt) { setShot(50); return; }
      const [wx] = HL.unproj(C, pt[0], pt[1], 24.0);
      setShot(HL.clamp((pt[0] - 55 + wx * 0.2) / 290, 0, 1) * 100.0);
    }
    function onRimClick() { spDeflect.t = 16.5; spNetFlutter.t = 4.5; dunkHoldTimer = 0.6; reg.wake(); }

    const reg = HL.register(stage, dt => {
      if (dunkHoldTimer > 0) {
        dunkHoldTimer -= dt;
        if (dunkHoldTimer <= 0) { spDeflect.t = 0; spNetFlutter.t = 0; }
      }
      const moving = HL.stepS(spT, dt) | HL.stepS(spDeflect, dt) | HL.stepS(spNetFlutter, dt) | (dunkHoldTimer > 0 ? 1 : 0);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: onRimClick, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setShot(Number(v)); }, destroy: bag.dispose };
  }
};
