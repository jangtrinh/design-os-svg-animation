/*
 * 5 Physical Education Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const PE_FIGURES = [
/*
 * 1. Mechanical Sports Stopwatch (Đồng Hồ Bấm Giờ Thể Thao)
 * Kinematics: Click để START / STOP / RESET; di chuột quanh mặt số để chỉnh thời gian (0–60s).
 */
{
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
},
/*
 * 2. Olympic Barbell & Weight Plates (Đòn Tạ & Đĩa Tạ Thể Hình)
 * Physical Concept: Trọng tải cơ học P = M·g · Công nâng tạ W = P·h · Độ võng uốn đàn hồi thanh đòn thép.
 */

{
  id: "pe-barbell",
  title: "2. Đòn Tạ Olympic (Barbell & Weight Plates)",
  concept: "Tải trọng cơ học: P = M·g · Công nâng tạ W = P·h · Độ võng uốn đàn hồi của thanh đòn thép",
  means: "Di chuột tăng giảm mức tạ từ 20kg đến 140kg. Các cặp đĩa tạ xếp chồng vào hai đầu đòn; thanh đòn thép uốn cong nhẹ và nhún đàn hồi chân thực theo tải trọng tác dụng.",
  rules: [1, 2, 4, 6, 9],
  range: [20, 60, 140],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.05);
    HL.fit(C, [[-48, -16, 0], [48, 16, 26]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Weightlifting Platform Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    HL.mk("path", {
      d: HL.seg(P(-47.8, -12, 2.6), P(47.8, -12, 2.6)) + HL.seg(P(-47.8, 12, 2.6), P(47.8, 12, 2.6)),
      class: "nf lo"
    }, svg);

    // 2. Back-left Squat Rack Upright (X = -19) & J-Cup Hook
    const rackZ0 = 2.5, rackZ1 = 23.5;
    const rackSolL = HL.solid(svg);
    const [rLkO, rLkI] = HL.rings(-20.8, -4.5, -17.2, 0.5, 0.5, 0.2);
    HL.put(rackSolL, HL.prism(P, front, rLkO, rLkI, rackZ0, rackZ1));

    const hookSolL = HL.solid(svg);
    const [hLO, hLI] = HL.rings(-21.2, 0.5, -16.8, 5.2, 0.4, 0.2);
    HL.put(hookSolL, HL.prism(P, front, hLO, hLI, 14.8, 17.2));

    // 3. Painter's Order: Back-Left Plates (-38, -33, -28), Shaft, Front-Right Rack, Front-Right Plates (+28, +33, +38)
    const barRestZ = 17.4, barY = 3.2;
    const plateSlots = [
      { lx: -27.5, rx: 27.5, r: 9.2 },
      { lx: -32.5, rx: 32.5, r: 7.8 },
      { lx: -37.0, rx: 37.0, r: 6.4 }
    ];

    const collarL = HL.mk("circle", { r: 2.2, class: "dot m" }, svg);
    // Append left plates back-to-front: idx 2 (-37), idx 1 (-32.5), idx 0 (-27.5)
    const solL2 = HL.solid(svg), solL1 = HL.solid(svg), solL0 = HL.solid(svg);
    const leftSols = [solL0, solL1, solL2];

    // Barbell 3D sleeve/shaft & grip knurling
    const barSleeveL = HL.mk("path", { class: "nf sil" }, svg);
    const barLine = HL.mk("path", { class: "nf sil" }, svg);
    const knurlPath = HL.mk("path", { class: "nf hi" }, svg);

    // Front-Right Squat Rack Upright (X = +19) & J-Cup Hook
    const rackSolR = HL.solid(svg);
    const [rRkO, rRkI] = HL.rings(17.2, -4.5, 20.8, 0.5, 0.5, 0.2);
    HL.put(rackSolR, HL.prism(P, front, rRkO, rRkI, rackZ0, rackZ1));

    const hookSolR = HL.solid(svg);
    const [hRO, hRI] = HL.rings(16.8, 0.5, 21.2, 5.2, 0.4, 0.2);
    HL.put(hookSolR, HL.prism(P, front, hRO, hRI, 14.8, 17.2));

    // Append right plates back-to-front: idx 0 (+27.5), idx 1 (+32.5), idx 2 (+37.0)
    const solR0 = HL.solid(svg), solR1 = HL.solid(svg), solR2 = HL.solid(svg);
    const rightSols = [solR0, solR1, solR2];
    const barSleeveR = HL.mk("path", { class: "nf sil" }, svg);
    const collarR = HL.mk("circle", { r: 2.2, class: "dot" }, svg);

    function buildPlatePaths(xCenter, zCenter, pR) {
      const hR = 2.4, halfT = 1.85, N = 24;
      const back = [], frontFace = [], innerRim = [], hub = [];
      for (let i = 0; i < N; i++) {
        const a = (i * 2 * Math.PI) / N;
        const dy = Math.cos(a), dz = Math.sin(a);
        back.push(P(xCenter - halfT, barY + pR * dy, zCenter + pR * dz));
        frontFace.push(P(xCenter + halfT, barY + pR * dy, zCenter + pR * dz));
        innerRim.push(P(xCenter + halfT, barY + (pR - 1.4) * dy, zCenter + (pR - 1.4) * dz));
        hub.push(P(xCenter + halfT, barY + hR * dy, zCenter + hR * dz));
      }
      return {
        sil: HL.poly(HL.hull(back.concat(frontFace))),
        crease: HL.poly(frontFace) + HL.poly(innerRim) + HL.poly(hub)
      };
    }

    const initialW = initialV != null ? initialV : 60;
    const spWeight = HL.spring(initialW, { k: 110, c: 13 });
    let lastKey = "";

    function draw() {
      const w = spWeight.x;
      const key = `${HL.r2(w)}`;
      if (key === lastKey) return;
      lastKey = key;

      const sag = ((w - 20) / 120.0) * 2.2;
      const zEnds = barRestZ;
      const zMid = barRestZ - sag;

      const pL = P(-25, barY, zEnds), pMid = P(0, barY, zMid), pR = P(25, barY, zEnds);
      barLine.setAttribute("d", `M${HL.r2(pL[0])} ${HL.r2(pL[1])}Q${HL.r2(pMid[0])} ${HL.r2(pMid[1])} ${HL.r2(pR[0])} ${HL.r2(pR[1])}`);
      barSleeveL.setAttribute("d", HL.seg(P(-42, barY, zEnds), pL));
      barSleeveR.setAttribute("d", HL.seg(P(38, barY, zEnds), P(43, barY, zEnds)));

      const kL0 = P(-14, barY, barRestZ - sag * 0.5), kL1 = P(-5, barY, barRestZ - sag * 0.85);
      const kR0 = P(5, barY, barRestZ - sag * 0.85), kR1 = P(14, barY, barRestZ - sag * 0.5);
      knurlPath.setAttribute("d", HL.seg(kL0, kL1) + HL.seg(kR0, kR1));

      const activePairs = w <= 25 ? 1 : w <= 75 ? 2 : 3;

      plateSlots.forEach((slot, idx) => {
        const sL = leftSols[idx], sR = rightSols[idx];
        if (idx < activePairs) {
          HL.put(sL, buildPlatePaths(slot.lx, zEnds, slot.r));
          HL.put(sR, buildPlatePaths(slot.rx, zEnds, slot.r));
          const isOuter = idx === activePairs - 1;
          sL.sil.classList.toggle("hi", isOuter);
          sR.sil.classList.toggle("hi", isOuter);
        } else {
          HL.put(sL, { sil: "", crease: "" });
          HL.put(sR, { sil: "", crease: "" });
          sL.sil.classList.remove("hi");
          sR.sil.classList.remove("hi");
        }
      });

      HL.place(collarL, P(-42, barY, zEnds));
      HL.place(collarR, P(43, barY, zEnds));

      const totalW = Math.round(w);
      const pN = Math.round(totalW * 9.8);
      const workJ = Math.round(pN * 0.75);
      read.textContent = `M=${totalW}kg · P=${pN}N · W=${workJ}J`;
    }

    function setWeight(val) {
      spWeight.t = HL.clamp(val, 20, 140);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setWeight(60); return; }
      const [wx] = HL.unproj(C, pt[0], pt[1], barRestZ);
      const norm = HL.clamp((wx + 38) / 76, 0, 1);
      setWeight(20 + norm * 120.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spWeight, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return {
      set(v) { setWeight(Number(v)); },
      destroy: bag.dispose
    };
  }
},
/*
 * 3. 4x100m Relay Baton & Exchange Zone (Gậy Tiếp Sức & Làn Chạy Điền Kinh)
 * Physical Concept: Vùng trao gậy 30m chuẩn World Athletics (WA Rule 24.19) từ -15m đến +15m.
 */

{
  id: "pe-relay-baton",
  title: "3. Gậy Tiếp Sức (Relay Baton & Track)",
  concept: "Điền kinh 4x100m: Vùng trao gậy 30m chuẩn World Athletics Rule 24.19 · Hợp lệ vs DQ",
  means: "Di chuột di chuyển vị trí trao gậy dọc đường chạy (-25m đến +25m). Trạng thái [HỢP LỆ] kích hoạt khi gậy nằm trọn vẹn trong vùng 30m, cảnh báo [DQ] khi rơi ra ngoài.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, 0, 20],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.35);
    HL.fit(C, [[-45, -20, 0], [45, 20, 24]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Running Track Platform (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -20, 45, 20, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    const laneY1 = -9.0, laneY2 = 9.0;
    HL.mk("path", {
      d: HL.seg(P(-44.5, laneY1, 2.6), P(44.5, laneY1, 2.6)) + HL.seg(P(-44.5, laneY2, 2.6), P(44.5, laneY2, 2.6)),
      class: "nf lo"
    }, svg);
    HL.mk("path", {
      d: HL.seg(P(-44, 0, 2.6), P(44, 0, 2.6)),
      class: "nf dash"
    }, svg);

    // 2. Takeover Zone Markings (X = -15 to +15, 30m zone per WA Rule 24.19)
    const zoneEntryX = -15.0, zoneExitX = 15.0;
    const entryLine = HL.mk("line", {
      x1: HL.r2(P(zoneEntryX, laneY1, 2.6)[0]), y1: HL.r2(P(zoneEntryX, laneY1, 2.6)[1]),
      x2: HL.r2(P(zoneEntryX, laneY2, 2.6)[0]), y2: HL.r2(P(zoneEntryX, laneY2, 2.6)[1]),
      class: "sil"
    }, svg);
    const exitLine = HL.mk("line", {
      x1: HL.r2(P(zoneExitX, laneY1, 2.6)[0]), y1: HL.r2(P(zoneExitX, laneY1, 2.6)[1]),
      x2: HL.r2(P(zoneExitX, laneY2, 2.6)[0]), y2: HL.r2(P(zoneExitX, laneY2, 2.6)[1]),
      class: "sil"
    }, svg);

    const chevronMark = HL.mk("path", {
      d: HL.open([P(-3.5, -2.5, 2.6), P(0, 0, 2.6), P(-3.5, 2.5, 2.6)]),
      class: "nf lo"
    }, svg);

    // 3. Ground Shadow, Motion Arc & 3D Cylindrical Relay Baton
    const shadowLine = HL.mk("line", { class: "lo" }, svg);
    const arcArrow = HL.mk("path", { class: "nf dash" }, svg);

    const batonGroup = HL.mk("g", {}, svg);
    const batonBody = HL.mk("polygon", { class: "sil" }, batonGroup);
    const batonBand = HL.mk("polygon", { class: "lo" }, batonGroup);
    const batonCapBot = HL.mk("path", { class: "lo" }, batonGroup);
    const batonCapTop = HL.mk("path", { class: "hi" }, batonGroup);

    const initialPos = initialV != null ? initialV : 0;
    const spPos = HL.spring(initialPos, { k: 130, c: 14 });
    let lastKey = "";

    function draw() {
      const x = spPos.x;
      const key = `${HL.r2(x)}`;
      if (key === lastKey) return;
      lastKey = key;

      const isInZone = x >= zoneEntryX && x <= zoneExitX;
      const bLen = 28.0, bRad = 3.2;
      const bAng = (28 * Math.PI) / 180;
      const cosB = Math.cos(bAng), sinB = Math.sin(bAng);
      const bCenter = [x, 0.0, 12.5];

      const e0 = [bCenter[0] - (bLen / 2) * cosB, 0, bCenter[2] - (bLen / 2) * sinB];
      const e1 = [bCenter[0] + (bLen / 2) * cosB, 0, bCenter[2] + (bLen / 2) * sinB];

      const capBotPts = [], capTopPts = [], bandPts0 = [], bandPts1 = [];
      const b0 = [bCenter[0] - 3.5 * cosB, 0, bCenter[2] - 3.5 * sinB];
      const b1 = [bCenter[0] + 3.5 * cosB, 0, bCenter[2] + 3.5 * sinB];
      const N = 20;
      for (let i = 0; i < N; i++) {
        const phi = (i / N) * Math.PI * 2;
        const cp = Math.cos(phi), sp = Math.sin(phi);
        const dx = bRad * sp * (-sinB), dy = bRad * cp, dz = bRad * sp * cosB;
        capBotPts.push(P(e0[0] + dx, dy, e0[2] + dz));
        capTopPts.push(P(e1[0] + dx, dy, e1[2] + dz));
        bandPts0.push(P(b0[0] + dx * 1.04, dy * 1.04, b0[2] + dz * 1.04));
        bandPts1.push(P(b1[0] + dx * 1.04, dy * 1.04, b1[2] + dz * 1.04));
      }

      batonCapBot.setAttribute("d", HL.poly(capBotPts));
      batonCapTop.setAttribute("d", HL.poly(capTopPts));

      const bodyHull = HL.hull(capBotPts.concat(capTopPts));
      batonBody.setAttribute("points", bodyHull.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const bandHull = HL.hull(bandPts0.concat(bandPts1));
      batonBand.setAttribute("points", bandHull.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const s0 = P(e0[0], 0, 2.6), s1 = P(e1[0], 0, 2.6);
      shadowLine.setAttribute("x1", HL.r2(s0[0])); shadowLine.setAttribute("y1", HL.r2(s0[1]));
      shadowLine.setAttribute("x2", HL.r2(s1[0])); shadowLine.setAttribute("y2", HL.r2(s1[1]));

      const arcPts = [];
      for (let k = -8; k <= 8; k += 2) {
        arcPts.push(P(x + k, 0, 18.5 - (k * k) * 0.04));
      }
      arcArrow.setAttribute("d", HL.open(arcPts));

      batonCapTop.classList.toggle("hi", true);
      batonBody.classList.toggle("hi", isInZone);
      entryLine.classList.toggle("hi", isInZone);
      exitLine.classList.toggle("hi", isInZone);
      chevronMark.classList.toggle("hi", isInZone);

      const tag = isInZone ? "VALID" : x < zoneEntryX ? "EARLY" : "DQ";
      read.textContent = `x=${HL.r2(x)}m · ${tag} (30m)`;
    }

    function setPos(val) {
      spPos.t = HL.clamp(val, -22, 22);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setPos(0); return; }
      const [wx] = HL.unproj(C, pt[0], pt[1], 12.5);
      setPos(wx);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spPos, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return {
      set(v) { setPos(Number(v)); },
      destroy: bag.dispose
    };
  }
},
/*
 * 4. Olympic Track Hurdle (Rào Điền Kinh Bật Nhảy)
 * Physical Concept: 5 mức chiều cao chuẩn World Athletics (76.2cm – 106.7cm) · Lực lật an toàn F ≥ 36 N.
 */

{
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
},
/*
 * 5. Basketball Breakaway Rim & Trajectory (Vành Rổ FIBA 3D Isometric & Quỹ Đạo Parabol)
 * Physical Concept: Cơ chế vành rổ đàn hồi FIBA (F ≥ 805 N) · Quỹ đạo parabol.
 */
{
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
},
];

// App Controller & View Logic for Physical Education Figures Suite (Hairline 2:1 Axonometric Standard)
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

  if (typeof HL !== "undefined") {
    if (!HL.cam) HL.cam = HL.Cam;
    HL._order = PE_FIGURES.map(f => f.id);
    HL.figures = Object.fromEntries(PE_FIGURES.map(f => [f.id, f]));
  }
  if (stage && stage.releasePointerCapture) {
    const origRelease = stage.releasePointerCapture.bind(stage);
    stage.releasePointerCapture = id => { try { origRelease(id); } catch {} };
  }

  let scrub = $("scrub");
  if (!scrub && slider && slider.parentElement) {
    scrub = document.createElement("input");
    scrub.id = "scrub";
    scrub.type = "range";
    scrub.min = "0";
    scrub.max = "1";
    scrub.step = "0.01";
    scrub.value = "0.5";
    scrub.hidden = true;
    slider.parentElement.appendChild(scrub);
    scrub.addEventListener("input", () => {
      slider.value = scrub.value;
      if (slider.oninput) slider.oninput();
    });
  }

  let currentIndex = 0;
  let currentHandle = null;

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) {
      const s = String(v || "rest").trim();
      readEl.textContent = s.length > 28 ? s.slice(0, 28) : s;
    }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    const picker = document.createElement("div");
    picker.id = "picker";
    picker.style.display = "contents";
    navTabs.appendChild(picker);

    PE_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn chip" + (idx === currentIndex ? " active" : "");
      btn.textContent = (idx + 1) + ". " + fig.id.replace(/^pe-/, "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
      btn.onclick = () => switchTo(idx);
      picker.appendChild(btn);
    });
  }

  function switchTo(idx) {
    currentIndex = (idx + PE_FIGURES.length) % PE_FIGURES.length;
    renderTabs();

    if (currentHandle) {
      if (currentHandle.destroy) currentHandle.destroy();
      else if (currentHandle.dispose) currentHandle.dispose();
      currentHandle = null;
    }
    stage.replaceChildren();

    const fig = PE_FIGURES[currentIndex];
    document.title = "Hairline · " + fig.id;
    stage.setAttribute("data-hairline", fig.id);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", fig.means);
    nameEl.textContent = fig.id;
    meansEl.textContent = fig.means;
    rulesEl.textContent = (fig.rules || []).map(n => String(n).padStart(2, "0") + " " + RULES[n - 1]).join(" · ");

    slider.value = "0.5";
    if (scrub) scrub.value = "0.5";
    const [lo, mid, hi] = fig.range;
    const at = (i) => Math.round((i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid)) * 1000) / 1000;
    valOut.textContent = String(at(0.5));

    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    Object.defineProperty(stage, "children", {
      configurable: true,
      get: () => svg.querySelectorAll("path,polygon,ellipse,line,circle")
    });
    readEl.textContent = "rest";
    currentHandle = fig.mount({ stage, svg, read: readBridge }, at(0.5));

    slider.oninput = () => {
      const v = at(Number(slider.value));
      if (scrub) scrub.value = slider.value;
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
      if (num >= 1 && num <= PE_FIGURES.length) {
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
