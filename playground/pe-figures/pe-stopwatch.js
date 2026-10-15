/*
 * 1. Mechanical Sports Stopwatch (Đồng Hồ Bấm Giờ Thể Thao)
 * Kinematics: Click để START / STOP / RESET; di chuột quanh mặt số để chỉnh thời gian (0–60s).
 */
export default {
  id: "pe-stopwatch",
  title: "1. Đồng Hồ Bấm Giờ Thể Thao (Olympic Stopwatch)",
  concept: "Đo thời gian điền kinh: v = s / t · Chuẩn cơ học 1/100 s · Kỷ lục 100m thế giới 9.58s",
  means: "Click vào đồng hồ để BẮT ĐẦU (START), DỪNG (STOP) hoặc TRẢ VỀ (RESET). Núm cơ học thụt sâu đàn hồi k=220, kim giây quét thời gian thực với đối trọng cân bằng.",
  rules: [1, 2, 4, 6, 7, 8, 9],
  range: [0, 9.58, 60],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 4.1);
    HL.fit(C, [[-34, -44, 0], [34, 34, 14]], 200, 162);
    const P = HL.proj(C), front = HL.facing(C);
    const toRing = pts => pts.map(([u, v]) => ({ u, v, nu: 0, nv: 0 }));

    const caseR = 30.0, cos45 = Math.cos(Math.PI / 4), sin45 = Math.sin(Math.PI / 4);
    const baseDialAngle = (225 * Math.PI) / 180;

    const standSol = HL.solid(svg);
    const [stO, stI] = HL.rings(-20, -20, 20, 20, 2.5, 0.8);
    HL.put(standSol, HL.prism(P, front, stO, stI, 0, 2.5));

    const caseSol = HL.solid(svg);
    HL.put(caseSol, HL.prism(P, front, HL.circ(caseR, 36), HL.circ(caseR - 1.2, 36), 2.5, 9.0));
    const bezelSol = HL.solid(svg);
    HL.put(bezelSol, HL.prism(P, front, HL.circ(28.5, 36), HL.circ(27.2, 36), 9.0, 11.5));

    const dialPts = [], dialInnerPts = [];
    for (let a = 0; a < 36; a++) {
      const ang = (a * 2 * Math.PI) / 36;
      dialPts.push(P(27.0 * Math.cos(ang), 27.0 * Math.sin(ang), 11.2));
      dialInnerPts.push(P(21.0 * Math.cos(ang), 21.0 * Math.sin(ang), 11.3));
    }
    HL.mk("path", { d: HL.poly(dialPts), class: "sil" }, svg);
    HL.mk("path", { d: HL.poly(dialInnerPts), class: "nf lo" }, svg);

    const subDist = 11.5, subCenter = [-subDist * cos45, -subDist * sin45, 11.3], subR = 6.8, subPts = [];
    for (let a = 0; a < 24; a++) {
      const ang = (a * 2 * Math.PI) / 24;
      subPts.push(P(subCenter[0] + subR * Math.cos(ang), subCenter[1] + subR * Math.sin(ang), 11.3));
    }
    HL.mk("path", { d: HL.poly(subPts), class: "nf lo" }, svg);

    let majD = "", minD = "";
    for (let s = 0; s < 60; s++) {
      const ang = baseDialAngle - (s * 6 * Math.PI) / 180, isMaj = s % 5 === 0;
      const pOut = P(26.2 * Math.cos(ang), 26.2 * Math.sin(ang), 11.3);
      const rIn = isMaj ? 22.8 : 24.8;
      const seg = HL.seg(P(rIn * Math.cos(ang), rIn * Math.sin(ang), 11.3), pOut);
      if (isMaj) majD += seg; else minD += seg;
    }
    for (let m = 0; m < 12; m++) {
      const ang = baseDialAngle - (m * 30 * Math.PI) / 180, isMaj = m % 3 === 0;
      const p1 = P(subCenter[0] + (subR - (isMaj ? 2.0 : 1.2)) * Math.cos(ang), subCenter[1] + (subR - (isMaj ? 2.0 : 1.2)) * Math.sin(ang), 11.3);
      const p2 = P(subCenter[0] + (subR - 0.4) * Math.cos(ang), subCenter[1] + (subR - 0.4) * Math.sin(ang), 11.3);
      if (isMaj) majD += HL.seg(p1, p2); else minD += HL.seg(p1, p2);
    }
    HL.mk("path", { d: majD, class: "nf sil" }, svg);
    HL.mk("path", { d: minD, class: "nf lo" }, svg);

    const crownNeckSol = HL.solid(svg), neckD0 = 28.5, neckD1 = 34.0, nW = 3.2;
    const neckPtsO = [
      [-neckD0 * cos45 - nW * sin45, -neckD0 * sin45 + nW * cos45],
      [-neckD1 * cos45 - nW * sin45, -neckD1 * sin45 + nW * cos45],
      [-neckD1 * cos45 + nW * sin45, -neckD1 * sin45 - nW * cos45],
      [-neckD0 * cos45 + nW * sin45, -neckD0 * sin45 - nW * cos45]
    ];
    HL.put(crownNeckSol, HL.prism(P, front, toRing(neckPtsO), toRing(neckPtsO.map(p => [p[0] * 0.96, p[1] * 0.96])), 8.5, 12.0));

    const bowPts = [];
    for (let a = -75; a <= 75; a += 15) {
      const rad = (a * Math.PI) / 180, u = 8.0 * Math.cos(rad), v = 8.0 * Math.sin(rad);
      bowPts.push(P((-35.5 - u) * cos45 - v * sin45, (-35.5 - u) * sin45 + v * cos45, 10.5));
    }
    HL.mk("path", { d: HL.open(bowPts), class: "nf sil" }, svg);

    const pusherSol = HL.solid(svg), lapPusherSol = HL.solid(svg);
    const lapA = baseDialAngle + (35 * Math.PI) / 180, lpW = 2.4;
    const lapPtsO = [
      [28.5 * Math.cos(lapA) - lpW * Math.sin(lapA), 28.5 * Math.sin(lapA) + lpW * Math.cos(lapA)],
      [33.5 * Math.cos(lapA) - lpW * Math.sin(lapA), 33.5 * Math.sin(lapA) + lpW * Math.cos(lapA)],
      [33.5 * Math.cos(lapA) + lpW * Math.sin(lapA), 33.5 * Math.sin(lapA) - lpW * Math.cos(lapA)],
      [28.5 * Math.cos(lapA) + lpW * Math.sin(lapA), 28.5 * Math.sin(lapA) - lpW * Math.cos(lapA)]
    ];
    HL.put(lapPusherSol, HL.prism(P, front, toRing(lapPtsO), toRing(lapPtsO.map(p => [p[0] * 0.95, p[1] * 0.95])), 8.0, 11.5));

    const splitSector = HL.mk("path", { class: "nf hi" }, svg);
    const subHand = HL.mk("line", { class: "sil" }, svg);
    const secCounterTail = HL.mk("line", { class: "lo" }, svg);
    const secTailRing = HL.mk("ellipse", { rx: 2.2, ry: 2.2, class: "sil" }, svg);
    const secHand = HL.mk("line", { class: "hi" }, svg);
    const pBoss = P(0, 0, 11.6);
    HL.mk("circle", { cx: HL.r2(pBoss[0]), cy: HL.r2(pBoss[1]), r: 2.0, class: "dot" }, svg);

    const initialT = initialV != null ? initialV : 9.58;
    const spTime = HL.spring(initialT, { k: 140, c: 15 }), spPusher = HL.spring(0, { k: 220, c: 14 });
    let watchRunning = false, accumulatedTime = initialT, lastKey = "";

    function draw() {
      const curT = spTime.x, pushX = spPusher.x;
      const key = `${HL.r2(curT)}:${HL.r2(pushX)}:${watchRunning ? 1 : 0}`;
      if (key === lastKey) return;
      lastKey = key;

      const secNorm = (curT % 60) / 60, minNorm = (curT / 1800) % 1;
      const secRad = baseDialAngle - secNorm * 2 * Math.PI;
      const pCenter = P(0, 0, 11.5), pTip = P(25.0 * Math.cos(secRad), 25.0 * Math.sin(secRad), 11.5);
      const pTail = P(-6.5 * Math.cos(secRad), -6.5 * Math.sin(secRad), 11.5);

      secHand.setAttribute("x1", HL.r2(pCenter[0])); secHand.setAttribute("y1", HL.r2(pCenter[1]));
      secHand.setAttribute("x2", HL.r2(pTip[0])); secHand.setAttribute("y2", HL.r2(pTip[1]));
      secCounterTail.setAttribute("x1", HL.r2(pCenter[0])); secCounterTail.setAttribute("y1", HL.r2(pCenter[1]));
      secCounterTail.setAttribute("x2", HL.r2(pTail[0])); secCounterTail.setAttribute("y2", HL.r2(pTail[1]));
      HL.place(secTailRing, pTail);

      const arcPts = [], steps = Math.max(2, Math.round(secNorm * 32));
      for (let i = 0; i <= steps; i++) {
        const a = baseDialAngle - (i / steps) * secNorm * 2 * Math.PI;
        arcPts.push(P(21.6 * Math.cos(a), 21.6 * Math.sin(a), 11.35));
      }
      // The sector starts on the inner dial ring (r=21.0) so its first end lands on a stroke.
      arcPts.unshift(P(21.0 * Math.cos(baseDialAngle), 21.0 * Math.sin(baseDialAngle), 11.3));
      splitSector.setAttribute("d", HL.open(arcPts));

      const minRad = baseDialAngle - minNorm * 2 * Math.PI;
      const pSubC = P(subCenter[0], subCenter[1], 11.4);
      const pSubT = P(subCenter[0] + 5.2 * Math.cos(minRad), subCenter[1] + 5.2 * Math.sin(minRad), 11.4);
      subHand.setAttribute("x1", HL.r2(pSubC[0])); subHand.setAttribute("y1", HL.r2(pSubC[1]));
      subHand.setAttribute("x2", HL.r2(pSubT[0])); subHand.setAttribute("y2", HL.r2(pSubT[1]));

      const dep = pushX * 2.8, pD0 = 34.0 - dep, pD1 = 38.2 - dep, pW = 2.8;
      const pshO = [
        [-pD0 * cos45 - pW * sin45, -pD0 * sin45 + pW * cos45],
        [-pD1 * cos45 - pW * sin45, -pD1 * sin45 + pW * cos45],
        [-pD1 * cos45 + pW * sin45, -pD1 * sin45 - pW * cos45],
        [-pD0 * cos45 + pW * sin45, -pD0 * sin45 - pW * cos45]
      ];
      HL.put(pusherSol, HL.prism(P, front, toRing(pshO), toRing(pshO.map(p => [p[0] * 0.95, p[1] * 0.95])), 8.8, 12.0));
      pusherSol.sil.classList.toggle("hi", watchRunning || pushX > 0.1);

      const tSec = Math.max(0.01, curT);
      read.textContent = `t=${tSec.toFixed(2)}s · v=${(100.0 / tSec).toFixed(1)}m/s`;
    }

    function setTime(val) { accumulatedTime = HL.clamp(val, 0, 60); spTime.t = accumulatedTime; reg.wake(); }
    function aim(pt) {
      if (!pt) return;
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 11.3);
      watchRunning = false;
      if (Math.hypot(wx, wy) > 3) {
        const turn = (((baseDialAngle - Math.atan2(wy, wx)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        setTime((turn / (2 * Math.PI)) * 60.0);
      } else setTime(HL.clamp((pt[0] - 60) / 280, 0, 1) * 60.0);
    }
    function onDown() {
      spPusher.x = 1.0; spPusher.t = 0.0;
      if (!watchRunning && accumulatedTime >= 59.9) accumulatedTime = 0;
      watchRunning = !watchRunning; reg.wake();
    }

    const reg = HL.register(stage, dt => {
      if (watchRunning) {
        accumulatedTime = Math.min(60.0, accumulatedTime + dt);
        if (accumulatedTime >= 60.0) watchRunning = false;
        spTime.t = accumulatedTime;
      }
      const moving = HL.stepS(spTime, dt) | HL.stepS(spPusher, dt) | (watchRunning ? 1 : 0);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: onDown, leave: () => { watchRunning = false; } }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { watchRunning = false; setTime(Number(v)); }, destroy: bag.dispose };
  }
};
