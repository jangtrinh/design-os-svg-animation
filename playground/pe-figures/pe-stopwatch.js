/*
 * 1. Mechanical Sports Stopwatch (Đồng Hồ Bấm Giờ Thể Thao Cao Cấp)
 * Benchmark Hairline Craftsmanship:
 *   - Loại bỏ hoàn toàn tấm ván trượt vô nghĩa; Đồng hồ bấm giờ là Hero Object chiếm 70% viewport.
 *   - Cấu trúc vỏ thép cơ khí 3 tầng (Main case, Bezel stepped chamfer, Inward crystal flange, Recessed dial).
 *   - Cụm núm đỉnh (Crown Pusher Assembly): Khớp hoàn hảo với cao độ Z của vành bezel (Z: 8.5 -> 12.5),
 *     núm bấm đỉnh nhún sâu đàn hồi k=220 khi bấm Start/Stop, vòng quai treo (Lanyard bow) uốn cung thép vút cao.
 *   - Núm phụ Split/Lap ở góc 10h (35° tilt) nhô ra ngoài thân vỏ chân thực.
 *   - Mặt số phân giải cao: Vòng 60 giây, vạch chia 1/5s, mặt số phụ 30 phút (30-minute subdial).
 *   - Kim quét chính có đối trọng đuôi tròn (counterweight pear/ring), kim phút phụ đồng bộ.
 * Kinematics: Click núm để START / STOP / RESET như đồng hồ cơ thật; kéo chuột để scrub thời gian.
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
    const C = HL.Cam(45, 0.5, 1.85);
    // Tight hero framing: fills 70-75% of viewport
    HL.fit(C, [[-36, -44, 0], [36, 36, 26]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);
    const toRing = pts => pts.map(([u, v]) => ({ u, v, nu: 0, nv: 0 }));

    const caseR = 30.0; // Hero scale (đường kính 60 units)
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);

    // 1. Ergonomic Inclined Desk Stand / Base Ring (Chân đế nghiêng công thái học Z: 0 -> 2.5)
    const standSol = HL.solid(svg);
    const [stO, stI] = HL.rings(-20, -20, 20, 20, 2.5, 0.8);
    HL.put(standSol, HL.prism(P, front, stO, stI, 0, 2.5));

    // 2. Main Steel Watch Case (Thân vỏ thép không gỉ Z: 2.5 -> 9.0)
    const caseSol = HL.solid(svg);
    const caseRingO = HL.circ(caseR, 36);
    const caseRingI = HL.circ(caseR - 1.2, 36);
    HL.put(caseSol, HL.prism(P, front, caseRingO, caseRingI, 2.5, 9.0));

    // 3. Stepped Bezel with Chamfer (Vành bezel vát cơ khí Z: 9.0 -> 11.5, R: 28.5)
    const bezelSol = HL.solid(svg);
    const bezelRingO = HL.circ(28.5, 36);
    const bezelRingI = HL.circ(27.2, 36);
    HL.put(bezelSol, HL.prism(P, front, bezelRingO, bezelRingI, 9.0, 11.5));

    // 4. Inward Crystal Flange & Recessed Dial (Mặt số lồi hạ âm tại Z = 11.2, R = 27.0)
    const dialFace = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, svg);
    const dialPts = [];
    for (let a = 0; a < 36; a++) {
      const ang = (a * 2 * Math.PI) / 36;
      dialPts.push(P(27.0 * Math.cos(ang), 27.0 * Math.sin(ang), 11.2));
    }
    dialFace.setAttribute("d", HL.poly(dialPts));

    // Inner dial decorative ring at R = 21.0
    const dialInnerPts = [];
    for (let a = 0; a < 36; a++) {
      const ang = (a * 2 * Math.PI) / 36;
      dialInnerPts.push(P(21.0 * Math.cos(ang), 21.0 * Math.sin(ang), 11.3));
    }
    HL.mk("path", { d: HL.poly(dialInnerPts), class: "lo", "stroke-width": 0.8, fill: "none" }, svg);

    // 5. Dial Graduations (Vòng chia 60 giây và 1/5 giây)
    const baseDialAngle = (225 * Math.PI) / 180;
    const dialMarksGroup = HL.mk("g", {}, svg);
    for (let s = 0; s < 60; s++) {
      const ang = baseDialAngle - (s * 6 * Math.PI) / 180; // Clockwise
      const isMajor = s % 5 === 0;
      const rOut = 26.2;
      const rIn = isMajor ? 22.8 : 24.8;
      const pOut = P(rOut * Math.cos(ang), rOut * Math.sin(ang), 11.3);
      const pIn = P(rIn * Math.cos(ang), rIn * Math.sin(ang), 11.3);
      HL.mk("line", {
        x1: HL.r2(pIn[0]), y1: HL.r2(pIn[1]),
        x2: HL.r2(pOut[0]), y2: HL.r2(pOut[1]),
        class: isMajor ? "hi" : "lo",
        "stroke-width": isMajor ? 1.4 : 0.7
      }, dialMarksGroup);
    }

    // 6. Sub-dial: 30-Minute Register at upper 12h position (along -cos45, -sin45 at dist 11.5)
    const subDist = 11.5;
    const subCenterX = -subDist * cos45;
    const subCenterY = -subDist * sin45;
    const subCenter = [subCenterX, subCenterY, 11.3];
    const subR = 6.8;
    const subPts = [];
    for (let a = 0; a < 24; a++) {
      const ang = (a * 2 * Math.PI) / 24;
      subPts.push(P(subCenter[0] + subR * Math.cos(ang), subCenter[1] + subR * Math.sin(ang), 11.3));
    }
    HL.mk("path", { d: HL.poly(subPts), class: "lo", "stroke-width": 0.9, fill: "none" }, dialMarksGroup);

    // Sub-dial ticks (0, 10, 20, 30 min)
    for (let m = 0; m < 12; m++) {
      const ang = baseDialAngle - (m * 30 * Math.PI) / 180;
      const isMaj = m % 3 === 0;
      const p1 = P(subCenter[0] + (subR - (isMaj ? 2.0 : 1.2)) * Math.cos(ang), subCenter[1] + (subR - (isMaj ? 2.0 : 1.2)) * Math.sin(ang), 11.3);
      const p2 = P(subCenter[0] + (subR - 0.4) * Math.cos(ang), subCenter[1] + (subR - 0.4) * Math.sin(ang), 11.3);
      HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        class: isMaj ? "hi" : "lo",
        "stroke-width": isMaj ? 1.0 : 0.6
      }, dialMarksGroup);
    }

    // Sub-dial mini hand
    const subHand = HL.mk("line", { class: "hi", "stroke-width": 1.2 }, dialMarksGroup);

    // 7. Crown & Pusher Assembly at 12 o'clock Apex (elevated at Z = 8.5 to 12.0)
    // Fixed Neck collar extending from D = 28.5 to 34.0 outside the case
    const crownNeckSol = HL.solid(svg);
    const neckD0 = 28.5, neckD1 = 34.0;
    const nW = 3.2; // Half width
    const neckPtsO = [
      [-neckD0 * cos45 - nW * sin45, -neckD0 * sin45 + nW * cos45],
      [-neckD1 * cos45 - nW * sin45, -neckD1 * sin45 + nW * cos45],
      [-neckD1 * cos45 + nW * sin45, -neckD1 * sin45 - nW * cos45],
      [-neckD0 * cos45 + nW * sin45, -neckD0 * sin45 - nW * cos45]
    ];
    const neckPtsI = neckPtsO.map(pt => [pt[0] * 0.96, pt[1] * 0.96]);
    HL.put(crownNeckSol, HL.prism(P, front, toRing(neckPtsO), toRing(neckPtsI), 8.5, 12.0));

    // Lanyard Loop / Crown Bow (Vòng quai treo bằng thép uốn cung qua đỉnh cao)
    const bowPts = [];
    const bowRadius = 8.5;
    const bowOriginD = 36.5;
    const bowOriginX = -bowOriginD * cos45;
    const bowOriginY = -bowOriginD * sin45;
    for (let a = -75; a <= 75; a += 10) {
      const rad = (a * Math.PI) / 180;
      const u = bowRadius * Math.cos(rad);
      const v = bowRadius * Math.sin(rad);
      const bx = bowOriginX - u * cos45 - v * sin45;
      const by = bowOriginY - u * sin45 + v * cos45;
      bowPts.push(P(bx, by, 10.5));
    }
    HL.mk("path", {
      d: "M " + bowPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
      class: "sil",
      "stroke-width": 2.2,
      stroke: "var(--hl-edge)",
      fill: "none"
    }, svg);

    // Main Crown Pusher Plunger (Núm bấm đỉnh nhún sâu vào thân)
    const pusherSol = HL.solid(svg);

    // Lap/Split Secondary Pusher at 10 o'clock (elevated at Z = 8.0 to 11.5, D = 28.5 to 33.5)
    const lapPusherSol = HL.solid(svg);
    const lapAngle = baseDialAngle + (35 * Math.PI) / 180;
    const lapD0 = 28.5, lapD1 = 33.5;
    const lpW = 2.4;
    const lapPtsO = [
      [lapD0 * Math.cos(lapAngle) - lpW * Math.sin(lapAngle), lapD0 * Math.sin(lapAngle) + lpW * Math.cos(lapAngle)],
      [lapD1 * Math.cos(lapAngle) - lpW * Math.sin(lapAngle), lapD1 * Math.sin(lapAngle) + lpW * Math.cos(lapAngle)],
      [lapD1 * Math.cos(lapAngle) + lpW * Math.sin(lapAngle), lapD1 * Math.sin(lapAngle) - lpW * Math.cos(lapAngle)],
      [lapD0 * Math.cos(lapAngle) + lpW * Math.sin(lapAngle), lapD0 * Math.sin(lapAngle) - lpW * Math.cos(lapAngle)]
    ];
    const lapPtsI = lapPtsO.map(pt => [pt[0] * 0.95, pt[1] * 0.95]);
    HL.put(lapPusherSol, HL.prism(P, front, toRing(lapPtsO), toRing(lapPtsI), 8.0, 11.5));

    // 8. Dynamic Central Sweep Second Hand Assembly
    const handGroup = HL.mk("g", {}, svg);
    const secHand = HL.mk("line", { class: "hi", "stroke-width": 1.6 }, handGroup);
    const secCounterTail = HL.mk("line", { class: "lo", "stroke-width": 1.6 }, handGroup);
    const secTailRing = HL.mk("circle", { r: 2.2, class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, handGroup);
    const centerBoss = HL.mk("circle", { cx: HL.r2(P(0, 0, 11.6)[0]), cy: HL.r2(P(0, 0, 11.6)[1]), r: 2.0, class: "dot" }, handGroup);

    // Kinematics Springs
    const initialT = initialV != null ? initialV : 9.58;
    const spTime = HL.spring(initialT, { k: 140, c: 15 });
    const spPusherDisp = HL.spring(0, { k: 220, c: 14 }); // Crown displacement when clicked

    // Real mechanical stopwatch states: 0: STOPPED, 1: RUNNING
    let watchRunning = false;
    let accumulatedTime = initialT;

    function draw() {
      const curT = spTime.x; // seconds (0 to 60)
      const secNorm = (curT % 60) / 60;
      const minNorm = (curT / 1800) % 1; // 30-minute dial

      // Angle for sweep seconds hand: starts at 12h (baseDialAngle), sweeps clockwise
      const secRad = baseDialAngle - secNorm * 2 * Math.PI;
      const pCenter = P(0, 0, 11.5);
      const tipR = 25.0;
      const tailR = 6.5;
      const pTip = P(tipR * Math.cos(secRad), tipR * Math.sin(secRad), 11.5);
      const pTail = P(-tailR * Math.cos(secRad), -tailR * Math.sin(secRad), 11.5);

      secHand.setAttribute("x1", HL.r2(pCenter[0]));
      secHand.setAttribute("y1", HL.r2(pCenter[1]));
      secHand.setAttribute("x2", HL.r2(pTip[0]));
      secHand.setAttribute("y2", HL.r2(pTip[1]));

      secCounterTail.setAttribute("x1", HL.r2(pCenter[0]));
      secCounterTail.setAttribute("y1", HL.r2(pCenter[1]));
      secCounterTail.setAttribute("x2", HL.r2(pTail[0]));
      secCounterTail.setAttribute("y2", HL.r2(pTail[1]));

      secTailRing.setAttribute("cx", HL.r2(pTail[0]));
      secTailRing.setAttribute("cy", HL.r2(pTail[1]));

      // Sub-dial minute hand
      const minRad = baseDialAngle - minNorm * 2 * Math.PI;
      const pSubCenter = P(subCenter[0], subCenter[1], 11.4);
      const pSubTip = P(subCenter[0] + 5.2 * Math.cos(minRad), subCenter[1] + 5.2 * Math.sin(minRad), 11.4);
      subHand.setAttribute("x1", HL.r2(pSubCenter[0]));
      subHand.setAttribute("y1", HL.r2(pSubCenter[1]));
      subHand.setAttribute("x2", HL.r2(pSubTip[0]));
      subHand.setAttribute("y2", HL.r2(pSubTip[1]));

      // Crown pusher dynamic displacement (plunges into watch body)
      const pushDepress = spPusherDisp.x * 2.8;
      const pshD0 = 34.0 - pushDepress;
      const pshD1 = 38.5 - pushDepress;
      const pW = 2.8;
      const pshPtsO = [
        [-pshD0 * cos45 - pW * sin45, -pshD0 * sin45 + pW * cos45],
        [-pshD1 * cos45 - pW * sin45, -pshD1 * sin45 + pW * cos45],
        [-pshD1 * cos45 + pW * sin45, -pshD1 * sin45 - pW * cos45],
        [-pshD0 * cos45 + pW * sin45, -pshD0 * sin45 - pW * cos45]
      ];
      const pshPtsI = pshPtsO.map(pt => [pt[0] * 0.95, pt[1] * 0.95]);
      HL.put(pusherSol, HL.prism(P, front, toRing(pshPtsO), toRing(pshPtsI), 8.8, 12.0));

      // Header Readout & Sprint Calculation
      const tSec = Math.max(0.01, curT);
      const vAvg = (100.0 / tSec).toFixed(2);
      const kmh = (Number(vAvg) * 3.6).toFixed(1);
      const stateLabel = watchRunning ? "[RUNNING]" : "[STOPPED]";

      read.textContent = `${stateLabel} t = ${tSec.toFixed(2)}s · Cự ly 100m: v = ${vAvg} m/s (${kmh} km/h) · Click để Start/Stop`;
    }

    function triggerClick() {
      // Plunge pusher button
      spPusherDisp.x = 1.0;
      spPusherDisp.t = 0.0;

      if (!watchRunning) {
        if (accumulatedTime >= 59.9) {
          // Reset
          accumulatedTime = 0;
          spTime.t = 0;
        }
        watchRunning = true;
      } else {
        // Stop
        watchRunning = false;
      }
      reg.wake();
    }

    function setTime(val) {
      accumulatedTime = HL.clamp(val, 0, 60);
      spTime.t = accumulatedTime;
      reg.wake();
    }

    function aim(pt) {
      if (!pt) return;
      // If user drags across stage, scrub time intuitively
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      watchRunning = false;
      setTime(norm * 60.0);
    }

    const reg = HL.register(stage, dt => {
      if (watchRunning) {
        accumulatedTime += dt;
        if (accumulatedTime >= 60.0) {
          accumulatedTime = 60.0;
          watchRunning = false;
        }
        spTime.t = accumulatedTime;
      }
      const moving = HL.stepS(spTime, dt) | HL.stepS(spPusherDisp, dt) | watchRunning;
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => {} }));
    stage.addEventListener("pointerdown", triggerClick);
    bag.add(() => stage.removeEventListener("pointerdown", triggerClick));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        watchRunning = false;
        setTime(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
};
