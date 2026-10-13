/*
 * 5 Physical Education Figures Definitions (Hairline 2:1 Axonometric Standard)
 * Modularized Architecture - Auto-bundled
 */

if (typeof HL !== "undefined" && HL.inject) {
  HL.inject(document);
}

const PE_FIGURES = [
/*
 * 1. Mechanical Sports Stopwatch (Đồng Hồ Bấm Giờ Thể Thao Cao Cấp)
 * Benchmark Lucas Markes Hairline Craftsmanship:
 *   - Loại bỏ hoàn toàn tấm ván trượt vô nghĩa; Đồng hồ bấm giờ là Hero Object chiếm 70% viewport.
 *   - Cấu trúc vỏ thép cơ khí 3 tầng (Main case, Bezel stepped chamfer, Inward crystal flange, Recessed dial).
 *   - Cụm núm đỉnh (Crown Pusher Assembly): Khớp hoàn hảo với cao độ Z của vành bezel (Z: 8.5 -> 12.5),
 *     núm bấm đỉnh nhún sâu đàn hồi k=220 khi bấm Start/Stop, vòng quai treo (Lanyard bow) uốn cung thép vút cao.
 *   - Núm phụ Split/Lap ở góc 10h (35° tilt) nhô ra ngoài thân vỏ chân thực.
 *   - Mặt số phân giải cao: Vòng 60 giây, vạch chia 1/5s, mặt số phụ 30 phút (30-minute subdial).
 *   - Kim quét chính có đối trọng đuôi tròn (counterweight pear/ring), kim phút phụ đồng bộ.
 * Kinematics: Click núm để START / STOP / RESET như đồng hồ cơ thật; kéo chuột để scrub thời gian.
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
},
/*
 * 2. Olympic Barbell & Weight Plates (Đòn Tạ & Đĩa Tạ Thể Hình)
 * Physical Concept: Trọng tải cơ học & Công thực hiện khi nâng tạ:
 *   - Thanh đòn tiêu chuẩn Olympic nam: Khối lượng m₀ = 20 kg.
 *   - Thêm các cặp đĩa tạ 20 kg ở hai đầu đòn: Tổng tải M từ 20 kg đến 140 kg.
 *   - Trọng lực đè nén: P = M · g (g ≈ 9.8 m/s²).
 *   - Công cơ học nâng tạ hoàn thành 1 lần Squat (h = 0.75 m): W = P · h.
 *   - Độ võng uốn đàn hồi của thép Olympic: δ ~ M · L³ / (48·E·I).
 * Geometry: Sàn nâng tạ thể thao đặc, cặp trụ giá đỡ Squat rack chữ U vững chãi,
 *   thanh đòn thép có khía vân tay nắm (knurl), các đĩa tạ cao su tròn đặc (100% opaque) và kẹp khóa tạ.
 * Kinematics: Di chuột điều chỉnh mức tạ từ 20 kg đến 140 kg; các đĩa tạ tự động xếp chồng vào ngàm,
 *   thanh đòn uốn võng và nhún đàn hồi sống động theo HL.spring.
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Weightlifting Platform Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Platform boundary guide lines
    HL.mk("line", {
      x1: HL.r2(P(-36, -12, 2.6)[0]), y1: HL.r2(P(-36, -12, 2.6)[1]),
      x2: HL.r2(P(36, -12, 2.6)[0]), y2: HL.r2(P(36, -12, 2.6)[1]),
      class: "lo", "stroke-width": 0.8
    }, svg);

    // 2. Dual Squat Rack Uprights at X = -20 and X = +20
    const rackZ0 = 2.5, rackZ1 = 22.0;
    const rackSolL = HL.solid(svg);
    const rackSolR = HL.solid(svg);
    const [rLkO, rLkI] = HL.rings(-22, -3.0, -18, 3.0, 0.6, 0.2);
    const [rRkO, rRkI] = HL.rings(18, -3.0, 22, 3.0, 0.6, 0.2);
    HL.put(rackSolL, HL.prism(P, front, rLkO, rLkI, rackZ0, rackZ1));
    HL.put(rackSolR, HL.prism(P, front, rRkO, rRkI, rackZ0, rackZ1));

    // J-cup hooks at Z = 16.0
    const hookSolL = HL.solid(svg);
    const hookSolR = HL.solid(svg);
    const [hLO, hLI] = HL.rings(-22.5, 2.5, -17.5, 5.5, 0.4, 0.2);
    const [hRO, hRI] = HL.rings(17.5, 2.5, 22.5, 5.5, 0.4, 0.2);
    HL.put(hookSolL, HL.prism(P, front, hLO, hLI, 15.0, 17.5));
    HL.put(hookSolR, HL.prism(P, front, hRO, hRI, 15.0, 17.5));

    // 3. Barbell Bar & Weight Plates
    // Bar sits at Y = 4.0, rest Z = 17.2, length from X = -42 to +42
    const barRestZ = 17.2;
    const barGroup = HL.mk("g", {}, svg);
    const barLine = HL.mk("path", { class: "sil", "stroke-width": 2.6, stroke: "var(--hl-edge)", fill: "none" }, barGroup);

    // Knurling markers along the bar (grip sections)
    const knurlL = HL.mk("line", { class: "lo", "stroke-width": 2.2 }, barGroup);
    const knurlR = HL.mk("line", { class: "lo", "stroke-width": 2.2 }, barGroup);

    // Plate slots: 3 pairs of 20kg plates (up to 140kg total)
    // Left plate positions: X = -28, -31.5, -35
    // Right plate positions: X = +28, +31.5, +35
    const plateSlots = [
      { lx: -28, rx: 28, kg: 20 },
      { lx: -31.5, rx: 31.5, kg: 20 },
      { lx: -35, rx: 35, kg: 20 }
    ];

    const plates = plateSlots.map(slot => {
      const gL = HL.mk("g", {}, barGroup);
      const gR = HL.mk("g", {}, barGroup);
      const solL = HL.solid(gL);
      const solR = HL.solid(gR);
      return { slot, gL, gR, solL, solR };
    });

    // Outer Collar locks at X = -38 and X = +38
    const collarGroup = HL.mk("g", {}, barGroup);
    const collarL = HL.mk("circle", { r: 2.2, class: "dot" }, collarGroup);
    const collarR = HL.mk("circle", { r: 2.2, class: "dot" }, collarGroup);

    // Kinematics Springs
    const initialW = initialV != null ? initialV : 60;
    const spWeight = HL.spring(initialW, { k: 110, c: 13 });

    function draw() {
      const w = spWeight.x; // 20 to 140 kg
      // Elastic sag at center: up to 1.8mm at 140kg
      const sag = ((w - 20) / 120.0) * 1.8;
      const barY = 4.0;
      const zEnds = barRestZ;
      const zMid = barRestZ - sag;

      // Draw flexing curved bar line
      const pL = P(-42, barY, zEnds);
      const pMid = P(0, barY, zMid);
      const pR = P(42, barY, zEnds);
      barLine.setAttribute("d", `M ${HL.r2(pL[0])} ${HL.r2(pL[1])} Q ${HL.r2(pMid[0])} ${HL.r2(pMid[1])} ${HL.r2(pR[0])} ${HL.r2(pR[1])}`);

      // Knurl markers
      const kL0 = P(-14, barY, barRestZ - sag * 0.5);
      const kL1 = P(-6, barY, barRestZ - sag * 0.8);
      knurlL.setAttribute("x1", HL.r2(kL0[0])); knurlL.setAttribute("y1", HL.r2(kL0[1]));
      knurlL.setAttribute("x2", HL.r2(kL1[0])); knurlL.setAttribute("y2", HL.r2(kL1[1]));

      const kR0 = P(6, barY, barRestZ - sag * 0.8);
      const kR1 = P(14, barY, barRestZ - sag * 0.5);
      knurlR.setAttribute("x1", HL.r2(kR0[0])); knurlR.setAttribute("y1", HL.r2(kR0[1]));
      knurlR.setAttribute("x2", HL.r2(kR1[0])); knurlR.setAttribute("y2", HL.r2(kR1[1]));

      // Active number of plate pairs:
      // w = 20kg -> 0 pairs
      // w <= 60kg -> 1 pair
      // w <= 100kg -> 2 pairs
      // w > 100kg -> 3 pairs
      const activePairs = w <= 25 ? 0 : w <= 65 ? 1 : w <= 105 ? 2 : 3;

      plates.forEach((p, idx) => {
        if (idx < activePairs) {
          p.gL.style.display = "";
          p.gR.style.display = "";

          // Bumper plate: Solid circular disk of radius 7.5 on Y-Z plane
          // In 2:1 axonometric projection, a circle on YZ plane is drawn with points:
          // X = const, Y = R cos(a), Z = R sin(a)
          const pR = 7.5;
          const leftPts = [];
          const rightPts = [];
          for (let a = 0; a < 24; a++) {
            const ang = (a * 2 * Math.PI) / 24;
            leftPts.push(P(p.slot.lx, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
            rightPts.push(P(p.slot.rx, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
          }

          // Thickness of plate in X: 2.2
          const leftThickPts = [];
          const rightThickPts = [];
          for (let a = 0; a < 24; a++) {
            const ang = (a * 2 * Math.PI) / 24;
            leftThickPts.push(P(p.slot.lx - 2.0, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
            rightThickPts.push(P(p.slot.rx + 2.0, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
          }

          let silL = HL.poly(leftPts);
          let silR = HL.poly(rightPts);
          HL.put(p.solL, { sil: silL, crease: "" });
          HL.put(p.solR, { sil: silR, crease: "" });

          p.solL.sil.classList.toggle("hi", w >= 100);
          p.solR.sil.classList.toggle("hi", w >= 100);
        } else {
          p.gL.style.display = "none";
          p.gR.style.display = "none";
        }
      });

      // Collars
      const colL = P(-38, barY, zEnds);
      const colR = P(38, barY, zEnds);
      collarL.setAttribute("cx", HL.r2(colL[0])); collarL.setAttribute("cy", HL.r2(colL[1]));
      collarR.setAttribute("cx", HL.r2(colR[0])); collarR.setAttribute("cy", HL.r2(colR[1]));

      // Header Readout
      const totalW = Math.round(w);
      const pN = Math.round(totalW * 9.8);
      const workJ = Math.round(pN * 0.75); // Squat lift 0.75m
      if (totalW >= 100) {
        read.textContent = `Đòn tạ: M = ${totalW} kg (${activePairs} cặp đĩa 20kg) · Trọng tải P = ${pN} N · Công nâng Squat (0.75m): W = ${workJ} J (.hi)`;
      } else {
        read.textContent = `Đòn tạ: M = ${totalW} kg (${activePairs} cặp đĩa) · Trọng tải P = ${pN} N · Công thực hiện W = ${workJ} J`;
      }
    }

    function setWeight(val) {
      spWeight.t = HL.clamp(val, 20, 140);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setWeight(60);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxScrX - minScrX), 0, 1);
      setWeight(20 + norm * 120.0);
    }
    const maxScrX = 340, minScrX = 60;

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
      set(v) {
        setWeight(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 3. 4x100m Relay Baton & Exchange Zone (Gậy Tiếp Sức & Làn Chạy Điền Kinh)
 * Physical Concept: Kỹ thuật trao nhận gậy tiếp sức tốc độ cao (Blind Pass):
 *   - Vùng trao gậy tiêu chuẩn World Athletics (WA Rule 24.19): Chiều dài 30m (từ -15m đến +15m quanh vạch chuẩn).
 *   - Trao gậy trong vùng: Hợp lệ ([VALID] - kích hoạt trạng thái .hi).
 *   - Trao gậy ngoài vùng: Phạm quy tức thì ([DISQUALIFIED - DQ]).
 *   - Đồng bộ vận tốc: VĐV số 1 và số 2 phải đạt vận tốc tiệm cận v ≈ 11.2 m/s tại thời điểm trao gậy.
 * Geometry: Đoạn đường chạy điền kinh tartan đặc, vạch phân làn trắng, vạch vàng giới hạn vùng 30m,
 *   mũi tên chevron tâm vùng; gậy tiếp sức bằng hợp kim nhôm dạng trụ tròn đặc 3D 100% opaque.
 * Kinematics: Di chuột kéo vị trí trao gậy dọc làn chạy (-25m -> +25m); gậy trượt êm ái,
 *   nhún nhẹ theo quán tính bước chạy, bóng đổ trên mặt đường, hiển thị trạng thái hợp lệ/phạm quy.
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
    const C = HL.Cam(45, 0.5, 2.0);
    HL.fit(C, [[-48, -20, 0], [48, 20, 32]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Running Track Platform (Bề mặt đường chạy điền kinh Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Running lane lines (Làn chạy số 4 tiêu chuẩn)
    const laneY1 = -9.0;
    const laneY2 = 9.0;
    const laneMidY = 0.0;

    // Outer white lane border lines at Z = 2.6
    HL.mk("line", {
      x1: HL.r2(P(-44, laneY1, 2.6)[0]), y1: HL.r2(P(-44, laneY1, 2.6)[1]),
      x2: HL.r2(P(44, laneY1, 2.6)[0]), y2: HL.r2(P(44, laneY1, 2.6)[1]),
      class: "lo", "stroke-width": 1.2, stroke: "var(--hl-edge)"
    }, svg);

    HL.mk("line", {
      x1: HL.r2(P(-44, laneY2, 2.6)[0]), y1: HL.r2(P(-44, laneY2, 2.6)[1]),
      x2: HL.r2(P(44, laneY2, 2.6)[0]), y2: HL.r2(P(44, laneY2, 2.6)[1]),
      class: "lo", "stroke-width": 1.2, stroke: "var(--hl-edge)"
    }, svg);

    // Center dash line along lane
    HL.mk("line", {
      x1: HL.r2(P(-44, laneMidY, 2.6)[0]), y1: HL.r2(P(-44, laneMidY, 2.6)[1]),
      x2: HL.r2(P(44, laneMidY, 2.6)[0]), y2: HL.r2(P(44, laneMidY, 2.6)[1]),
      class: "lo", "stroke-width": 0.8, stroke: "var(--hl-edge)",
      "stroke-dasharray": "3,3"
    }, svg);

    // 2. Takeover Zone Markings (from X = -15 to +15, representing 30m zone per WA Rule 24.19)
    const zoneEntryX = -15.0;
    const zoneExitX = 15.0;
    const zoneGroup = HL.mk("g", {}, svg);

    // Entry hook mark (Vạch vào vùng)
    const entryLine = HL.mk("line", {
      x1: HL.r2(P(zoneEntryX, laneY1, 2.6)[0]), y1: HL.r2(P(zoneEntryX, laneY1, 2.6)[1]),
      x2: HL.r2(P(zoneEntryX, laneY2, 2.6)[0]), y2: HL.r2(P(zoneEntryX, laneY2, 2.6)[1]),
      class: "sil", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, zoneGroup);

    // Exit hook mark (Vạch ra vùng)
    const exitLine = HL.mk("line", {
      x1: HL.r2(P(zoneExitX, laneY1, 2.6)[0]), y1: HL.r2(P(zoneExitX, laneY1, 2.6)[1]),
      x2: HL.r2(P(zoneExitX, laneY2, 2.6)[0]), y2: HL.r2(P(zoneExitX, laneY2, 2.6)[1]),
      class: "sil", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, zoneGroup);

    // Central takeover point Chevron mark at X = 0
    const chevA = P(-3.5, -2.5, 2.6);
    const chevTip = P(0.0, 0.0, 2.6);
    const chevB = P(-3.5, 2.5, 2.6);
    const chevronMark = HL.mk("path", {
      d: `M ${HL.r2(chevA[0])} ${HL.r2(chevA[1])} L ${HL.r2(chevTip[0])} ${HL.r2(chevTip[1])} L ${HL.r2(chevB[0])} ${HL.r2(chevB[1])}`,
      class: "lo", "stroke-width": 1.6, fill: "none"
    }, zoneGroup);

    // 3. Ground Shadow of Baton
    const shadowLine = HL.mk("line", {
      class: "lo",
      stroke: "var(--hl-edge)",
      "stroke-width": 3.0,
      "stroke-linecap": "round",
      opacity: 0.35
    }, svg);

    // 4. 3D Cylindrical Relay Baton (Hero Scale, 3D perpendicular cross-section caps)
    const batonGroup = HL.mk("g", {}, svg);
    const batonBody = HL.mk("polygon", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, batonGroup);
    const batonBand = HL.mk("polygon", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, batonGroup);
    const batonCapTop = HL.mk("path", { class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, batonGroup);
    const batonCapBot = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, batonGroup);

    // Kinematics Springs
    const initialPos = initialV != null ? initialV : 0;
    const spPos = HL.spring(initialPos, { k: 130, c: 14 });

    function draw() {
      const x = spPos.x; // -25 to +25
      const isInZone = x >= zoneEntryX && x <= zoneExitX;

      // Baton Geometry in 3D:
      // Tilted forward in running direction: length 30, radius 3.2, center at (x, 0, 13.0)
      const bLen = 30.0;
      const bRad = 3.2;
      const bAng = (28 * Math.PI) / 180; // Slanted 28 deg forward in X-Z plane
      const bCenter = [x, 0.0, 13.0];

      const cosB = Math.cos(bAng), sinB = Math.sin(bAng);
      const e0_3D = [bCenter[0] - (bLen / 2) * cosB, bCenter[1], bCenter[2] - (bLen / 2) * sinB]; // Lower end
      const e1_3D = [bCenter[0] + (bLen / 2) * cosB, bCenter[1], bCenter[2] + (bLen / 2) * sinB]; // Upper end

      // Unit normal vectors perpendicular to baton axis in 3D
      // Axis is along (cosB, 0, sinB)
      // Perpendicular 1: (0, 1, 0)
      // Perpendicular 2: (-sinB, 0, cosB)
      const capBotPts = [], capTopPts = [];
      const numCapPts = 24;
      for (let i = 0; i < numCapPts; i++) {
        const phi = (i / numCapPts) * Math.PI * 2;
        const cp = Math.cos(phi), sp = Math.sin(phi);
        const dx = bRad * sp * (-sinB);
        const dy = bRad * cp;
        const dz = bRad * sp * cosB;
        capBotPts.push(P(e0_3D[0] + dx, e0_3D[1] + dy, e0_3D[2] + dz));
        capTopPts.push(P(e1_3D[0] + dx, e1_3D[1] + dy, e1_3D[2] + dz));
      }

      batonCapBot.setAttribute("d", HL.poly(capBotPts));
      batonCapTop.setAttribute("d", HL.poly(capTopPts));

      // Baton cylinder body: convex hull of two 3D end rings
      const allPts = capBotPts.concat(capTopPts);
      const bodyHull = HL.hull(allPts);
      batonBody.setAttribute("points", bodyHull.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Center grip band (middle 25% of cylinder)
      const band0_3D = [bCenter[0] - 3.5 * cosB, bCenter[1], bCenter[2] - 3.5 * sinB];
      const band1_3D = [bCenter[0] + 3.5 * cosB, bCenter[1], bCenter[2] + 3.5 * sinB];
      const bandPts0 = [], bandPts1 = [];
      for (let i = 0; i < numCapPts; i++) {
        const phi = (i / numCapPts) * Math.PI * 2;
        const cp = Math.cos(phi), sp = Math.sin(phi);
        const dx = (bRad + 0.15) * sp * (-sinB);
        const dy = (bRad + 0.15) * cp;
        const dz = (bRad + 0.15) * sp * cosB;
        bandPts0.push(P(band0_3D[0] + dx, band0_3D[1] + dy, band0_3D[2] + dz));
        bandPts1.push(P(band1_3D[0] + dx, band1_3D[1] + dy, band1_3D[2] + dz));
      }
      const bandHull = HL.hull(bandPts0.concat(bandPts1));
      batonBand.setAttribute("points", bandHull.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Ground shadow
      const s0 = P(e0_3D[0], e0_3D[1], 2.6);
      const s1 = P(e1_3D[0], e1_3D[1], 2.6);
      shadowLine.setAttribute("x1", HL.r2(s0[0])); shadowLine.setAttribute("y1", HL.r2(s0[1]));
      shadowLine.setAttribute("x2", HL.r2(s1[0])); shadowLine.setAttribute("y2", HL.r2(s1[1]));

      // Highlight activation
      batonCapTop.classList.toggle("hi", isInZone);
      batonBody.classList.toggle("hi", isInZone);
      entryLine.classList.toggle("hi", isInZone);
      exitLine.classList.toggle("hi", isInZone);
      chevronMark.classList.toggle("hi", isInZone);

      // Header Readout
      const mStr = HL.r2(x); // In meters (-22m to +22m, zone is -15m to +15m = 30m)
      if (isInZone) {
        read.textContent = `Tiếp sức 4x100m: Vị trí gậy X = ${mStr}m · [HỢP LỆ] Đang trong vùng trao gậy 30m (WA Rule 24.19) · v ≈ 11.2 m/s`;
      } else if (x < zoneEntryX) {
        read.textContent = `Tiếp sức 4x100m: Vị trí gậy X = ${mStr}m · [CHƯA VÀO VÙNG] Cự ly tiếp cận, người nhận tăng tốc`;
      } else {
        read.textContent = `Tiếp sức 4x100m: Vị trí gậy X = ${mStr}m · [PHẠM QUY - DQ] Vượt quá giới hạn vùng trao gậy 30m!`;
      }
    }

    function setPos(val) {
      spPos.t = HL.clamp(val, -22, 22);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setPos(0);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setPos(-22 + norm * 44.0);
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
      set(v) {
        setPos(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
},
/*
 * 4. Olympic Track Hurdle (Rào Điền Kinh Bật Nhảy)
 * Physical Concept: Cơ chế rào vượt chướng ngại vật điền kinh:
 *   - 5 mức chiều cao tiêu chuẩn World Athletics (WA):
 *     76.2 cm (400m nữ), 83.8 cm (100m nữ), 91.4 cm (400m nam), 106.7 cm (110m nam).
 *   - Cơ chế đối trọng lật đổ an toàn: Lực xô ngang F ≥ 3.6 kg (≈ 36 N) ở mép trên
 *     sẽ làm rào lật đổ về phía trước giúp vận động viên không bị chấn thương.
 * Geometry: Đế chân chữ L kép bằng thép đặc, thanh giằng ngang, cặp trụ lồng ống điều chỉnh chiều cao,
 *   thanh xà ngang rào có các sọc tương phản trắng-đen tiêu chuẩn (100% opaque).
 * Kinematics: Di chuột điều chỉnh chiều cao rào từ 76cm đến 107cm; ống lồng trượt êm ái,
 *   thanh xà nâng cao mượt mà và nhún đàn hồi sống động theo HL.spring.
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Running Track Platform (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. Dual L-shaped Feet (Chân đế chữ L kép)
    // Left foot at X = -18, Y from -10 to +8, Z = 2.5 to 4.5
    // Right foot at X = +18, Y from -10 to +8, Z = 2.5 to 4.5
    const footSolL = HL.solid(svg);
    const footSolR = HL.solid(svg);
    const [ftLO, ftLI] = HL.rings(-20, -10, -16, 8, 0.8, 0.3);
    const [ftRO, ftRI] = HL.rings(16, -10, 20, 8, 0.8, 0.3);
    HL.put(footSolL, HL.prism(P, front, ftLO, ftLI, 2.5, 4.5));
    HL.put(footSolR, HL.prism(P, front, ftRO, ftRI, 2.5, 4.5));

    // Cross brace connecting feet at Y = -6, Z = 3.0 to 4.5
    const braceSol = HL.solid(svg);
    const [brO, brI] = HL.rings(-16, -7.0, 16, -5.0, 0.5, 0.2);
    HL.put(braceSol, HL.prism(P, front, brO, brI, 2.8, 4.5));

    // 3. Fixed Outer Upright Columns at X = -18 and X = +18 (Y = 0, Z = 4.5 to 16.0)
    const postSolL = HL.solid(svg);
    const postSolR = HL.solid(svg);
    const [pLO, pLI] = HL.rings(-19.5, -1.5, -16.5, 1.5, 0.5, 0.2);
    const [pRO, pRI] = HL.rings(16.5, -1.5, 19.5, 1.5, 0.5, 0.2);
    HL.put(postSolL, HL.prism(P, front, pLO, pLI, 4.5, 15.5));
    HL.put(postSolR, HL.prism(P, front, pRO, pRI, 4.5, 15.5));

    // Adjustment locking knobs at Z = 14.5
    const knobL = HL.mk("circle", { cx: HL.r2(P(-20.5, 0, 14.5)[0]), cy: HL.r2(P(-20.5, 0, 14.5)[1]), r: 1.5, class: "dot" }, svg);
    const knobR = HL.mk("circle", { cx: HL.r2(P(20.5, 0, 14.5)[0]), cy: HL.r2(P(20.5, 0, 14.5)[1]), r: 1.5, class: "dot" }, svg);

    // 4. Moving Telescopic Inner Assembly & Top Hurdle Board
    const hurdleGroup = HL.mk("g", {}, svg);
    const innerTubesSol = HL.solid(hurdleGroup);
    const boardGroup = HL.mk("g", {}, hurdleGroup);
    const boardSol = HL.solid(boardGroup);

    // Contrasting zebra stripes on the hurdle board
    const stripesGroup = HL.mk("g", {}, boardGroup);
    const stripePaths = [];
    for (let s = 0; s < 4; s++) {
      const sp = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, stripesGroup);
      stripePaths.push(sp);
    }

    // Kinematics Springs
    const initialH = initialV != null ? initialV : 91.4;
    const spH = HL.spring(initialH, { k: 120, c: 14 });

    function draw() {
      const hCm = spH.x; // 76.2 to 106.7 cm
      // Map hCm to 3D Z coordinate: 76.2cm -> Z = 18.0, 106.7cm -> Z = 28.0
      const curZ = 18.0 + ((hCm - 76.2) / (106.7 - 76.2)) * 10.0;
      const boardH = 3.6; // Board height in Z
      const boardW = 0.8; // Board thickness in Y

      // A. Inner Telescopic Tubes (Z: 14.0 to curZ)
      const [inLO, inLI] = HL.rings(-19.0, -1.0, -17.0, 1.0, 0.4, 0.2);
      const [inRO, inRI] = HL.rings(17.0, -1.0, 19.0, 1.0, 0.4, 0.2);
      let inSil = "";
      const pL_b = HL.prism(P, front, inLO, inLI, 14.0, curZ);
      const pR_b = HL.prism(P, front, inRO, inRI, 14.0, curZ);
      HL.put(innerTubesSol, { sil: pL_b.sil + " " + pR_b.sil, crease: "" });

      // B. Top Hurdle Board (X: -22 to +22, Y = 0, Z: curZ to curZ + boardH)
      const b00 = P(-22, -boardW, curZ);
      const b10 = P(22, -boardW, curZ);
      const b11 = P(22, boardW, curZ);
      const b01 = P(-22, boardW, curZ);

      const b00T = P(-22, -boardW, curZ + boardH);
      const b10T = P(22, -boardW, curZ + boardH);
      const b11T = P(22, boardW, curZ + boardH);
      const b01T = P(-22, boardW, curZ + boardH);

      let bSil = "";
      // Front face (+Y)
      bSil += HL.poly([b01, b11, b11T, b01T]);
      // Right face (+X)
      bSil += HL.poly([b11, b10, b10T, b11T]);
      // Top face (+Z)
      bSil += HL.poly([b00T, b10T, b11T, b01T]);

      HL.put(boardSol, { sil: bSil, crease: "" });

      // Contrasting stripes on the front face (at X = -14..-8 and X = 8..14)
      const stripeSlots = [
        [-14, -8],
        [8, 14]
      ];
      stripeSlots.forEach((slot, idx) => {
        const s0 = P(slot[0], boardW + 0.1, curZ);
        const s1 = P(slot[1], boardW + 0.1, curZ);
        const s1T = P(slot[1], boardW + 0.1, curZ + boardH);
        const s0T = P(slot[0], boardW + 0.1, curZ + boardH);
        stripePaths[idx].setAttribute("d", HL.poly([s0, s1, s1T, s0T]));
        stripePaths[idx].classList.toggle("hi", true);
      });

      // Highlight effect
      const isOlympicHigh = hCm >= 105.0;
      boardSol.sil.classList.toggle("hi", isOlympicHigh);

      // Header Readout
      const hStr = HL.r2(hCm);
      let desc = "";
      if (hCm <= 78) desc = "400m Rào Nữ (76.2 cm)";
      else if (hCm <= 86) desc = "100m Rào Nữ (83.8 cm)";
      else if (hCm <= 95) desc = "400m Rào Nam (91.4 cm)";
      else desc = "110m Rào Nam Tiêu Chuẩn Olympic (106.7 cm)";

      read.textContent = `Rào điền kinh: h = ${hStr} cm · Chuẩn: [${desc}] · Lực lật an toàn WA: F ≥ 36 N (.hi)`;
    }

    function setHurdle(val) {
      spH.t = HL.clamp(val, 76.2, 106.7);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setHurdle(91.4);
        return;
      }
      const minY = 30, maxY = 130;
      const norm = HL.clamp(1.0 - (pt[1] - minY) / (maxY - minY), 0, 1);
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
      set(v) {
        setHurdle(Number(v));
      },
      destroy: bag.dispose
    };
  }
},
/*
 * 5. Basketball Breakaway Rim & Trajectory (Vành Rổ FIBA 3D Isometric & Quỹ Đạo Parabol)
 * Physical Concept: Cơ chế vành rổ đàn hồi FIBA Official Breakaway Rim (EN 1270 / FIBA Level 1):
 *   - Bảng rổ tiêu chuẩn: Kích thước 180cm x 105cm, ô chữ nhật ngắm bắn 59cm x 45cm.
 *   - Cơ chế lò xo giảm chấn: Khóa ngàm cứng khi tải F < 805 N (~82 kg). Khi slam dunk / va chạm
 *     mạnh F = 820 N - 1050 N, lò xo nén giải phóng góc gập xuống θ ≤ 25°, bảo vệ bảng kính tempered.
 *   - Khi bóng rời rổ, hệ lò xo - giảm chấn đưa vành nảy hồi vị tức thì (k = 240 N/rad, c = 16 N·s/rad).
 * Geometry (Lucas Markes Specimen Discipline):
 *   - Hero Scale: Chiếm 70% viewport, góc chiếu 3/4 isometric 2:1 chuẩn xác.
 *   - Trụ rổ di động có đệm vinyl bảo vệ FIBA và 2 thanh giằng chịu lực vươn đỡ bảng rổ.
 *   - Bảng rổ viền thép đặc, khung ngắm bắn chuẩn xác.
 *   - Hộp lò xo cơ khí có chốt bản lề ngang và cặp lò xo trụ nén.
 *   - Vành rổ xuyến rỗng (open torus ring, đường kính trong 450mm), TÁCH CUNG TRƯỚC / SAU để
 *     che khuất quả bóng khi bóng chui vào lòng rổ.
 *   - Lưới rổ đan kim cương (12 loop diamond mesh) rỗng ruột, phồng nở và rung lắc khi bóng xuyên qua.
 * Kinematics & Physics:
 *   - Quỹ đạo ném parabol thật từ vạch 3 điểm bay vào tâm rổ.
 *   - Di chuột điều khiển quỹ đạo; click vào vành rổ để kích hoạt bài test tải trọng Slam Dunk (F = 950 N).
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
    // High-impact Hero scale S = 3.4
    const C = HL.Cam(45, 0.5, 3.4);
    HL.fit(C, [[-26, -26, 0], [24, 18, 44]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Court Baseline & Restricted Area Key Markings (Z = 0.1)
    const floorGroup = HL.mk("g", { class: "lo" }, svg);
    const blA = P(-30, -12, 0.1), blB = P(24, -12, 0.1);
    HL.mk("line", {
      x1: HL.r2(blA[0]), y1: HL.r2(blA[1]),
      x2: HL.r2(blB[0]), y2: HL.r2(blB[1]),
      stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, floorGroup);

    // Free-throw key arc on court (center X = 0, Y = 0, R = 15)
    const keyArcPts = [];
    for (let a = -70; a <= 120; a += 10) {
      const rad = (a * Math.PI) / 180;
      const x = 15 * Math.cos(rad);
      const y = 15 * Math.sin(rad);
      keyArcPts.push(P(x, y, 0.1));
    }
    HL.mk("path", {
      d: "M " + keyArcPts.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
      fill: "none", stroke: "var(--hl-edge)", "stroke-width": 0.9, "stroke-dasharray": "3,3"
    }, floorGroup);

    // 2. Heavy Stanchion Base & Protective Vinyl Padding (Behind backboard, Y = -26 to -18)
    // Stanchion base block
    const [stO, stI] = HL.rings(-10, -26, 10, -18, 2.0, 0.8);
    const stSol = HL.solid(svg);
    HL.put(stSol, HL.prism(P, front, stO, stI, 0, 10));

    // Angled vinyl protective front pad on stanchion
    const [padO, padI] = HL.rings(-8.5, -18, 8.5, -14.5, 1.2, 0.5);
    const padSol = HL.solid(svg);
    HL.put(padSol, HL.prism(P, front, padO, padI, 0, 12));

    // Dual steel cantilever support booms from padding up to backboard
    // Left strut (X = -6 to -4, Y = -16 to -11, Z = 11 to 24)
    const [strutLO, strutLI] = HL.rings(-6.5, -16.0, -4.0, -11.0, 0.8, 0.3);
    const strutLSol = HL.solid(svg);
    HL.put(strutLSol, HL.prism(P, front, strutLO, strutLI, 11, 24));

    // Right strut (X = 4 to 6.5, Y = -16 to -11, Z = 11 to 24)
    const [strutRO, strutRI] = HL.rings(4.0, -16.0, 6.5, -11.0, 0.8, 0.3);
    const strutRSol = HL.solid(svg);
    HL.put(strutRSol, HL.prism(P, front, strutRO, strutRI, 11, 24));

    // 3. Backboard (Bảng rổ tiêu chuẩn: X = -17 to 17, Y = -11.5 to -10.0, Z = 20 to 36)
    const [boardO, boardI] = HL.rings(-17, -11.5, 17, -10.0, 1.0, 0.4);
    const boardSol = HL.solid(svg);
    HL.put(boardSol, HL.prism(P, front, boardO, boardI, 20, 36));

    // Inner targeting box (59cm x 45cm) at front face Y = -9.9
    const boxPts = [
      P(-5.5, -9.9, 22.5),
      P(5.5, -9.9, 22.5),
      P(5.5, -9.9, 28.5),
      P(-5.5, -9.9, 28.5)
    ];
    HL.mk("polygon", {
      points: boxPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "),
      class: "hi", fill: "none", stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, svg);

    // 4. Breakaway Spring Housing (Hộp lò xo gắn vành rổ X = -2.5 to 2.5, Y = -10.0 to -7.0, Z = 22.5 to 24.5)
    const [bracketO, bracketI] = HL.rings(-2.5, -10.0, 2.5, -7.0, 0.6, 0.3);
    const bracketSol = HL.solid(svg);
    HL.put(bracketSol, HL.prism(P, front, bracketO, bracketI, 22.5, 24.5));

    // Horizontal hinge pin across spring housing at Y = -7.0, Z = 23.6
    const pinA = P(-2.7, -7.0, 23.6), pinB = P(2.7, -7.0, 23.6);
    HL.mk("line", {
      x1: HL.r2(pinA[0]), y1: HL.r2(pinA[1]),
      x2: HL.r2(pinB[0]), y2: HL.r2(pinB[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, svg);

    // 5. Breakaway Rim & Net Geometry Parameters
    const yHinge = -7.0, zHinge = 23.6;
    const xCenter = 0, yCenter = 0.5;
    const rimRadiusOut = 7.0;
    const rimRadiusIn = 5.8; // Open hollow torus ring
    const netHangLen = 11.0;

    // SVG Layer Hierarchy for Depth Occlusion:
    // Layer A: Rear Net cords + Rear Rim Arc (far side, Y < yCenter)
    // Layer B: Basketball (passing through rim)
    // Layer C: Front Net cords + Front Rim Arc (near side, Y >= yCenter)
    const rearRimGroup = HL.mk("g", { class: "rear-rim" }, svg);
    const rearNetCords = HL.mk("g", { class: "lo" }, rearRimGroup);
    const rearRimPath = HL.mk("path", { class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, rearRimGroup);

    // Basketball Group (Layer B)
    const ballGroup = HL.mk("g", { class: "basketball" }, svg);
    const ballBody = HL.mk("circle", { r: 4.4, fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, ballGroup);
    const seamH = HL.mk("path", { fill: "none", stroke: "var(--hl-edge)", class: "lo" }, ballGroup);
    const seamV = HL.mk("path", { fill: "none", stroke: "var(--hl-edge)", class: "lo" }, ballGroup);

    // Front Rim & Net (Layer C)
    const frontRimGroup = HL.mk("g", { class: "front-rim" }, svg);
    const frontNetCords = HL.mk("g", { class: "lo" }, frontRimGroup);
    const frontRimPath = HL.mk("path", { class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, frontRimGroup);

    // Kinematic Springs
    const initialT = initialV != null ? initialV : 0;
    const spT = HL.spring(initialT, { k: 110, c: 14 }); // Shot progress 0% -> 100%
    const spDeflect = HL.spring(0, { k: 240, c: 16 }); // Rim downward angle deflection (deg, 0 -> 25)
    const spNetFlutter = HL.spring(0, { k: 180, c: 14 }); // Net ripple expansion
    let dunkHoldTimer = 0;

    function getDeflectedPoint(x, y, z, thetaRad) {
      const dy = y - yHinge;
      const dz = z - zHinge;
      const yRot = yHinge + dy * Math.cos(thetaRad) + dz * Math.sin(thetaRad);
      const zRot = zHinge - dy * Math.sin(thetaRad) + dz * Math.cos(thetaRad);
      return P(x, yRot, zRot);
    }

    // Diamond Net Cord Segments (12 loops * 3 tiers = ~48 segments)
    const numLoops = 12;
    const rearLines = [], frontLines = [];
    const maxNetSegs = 60;
    for (let i = 0; i < maxNetSegs; i++) {
      rearLines.push(HL.mk("line", { stroke: "var(--hl-edge)", "stroke-width": 0.8 }, rearNetCords));
      frontLines.push(HL.mk("line", { stroke: "var(--hl-edge)", "stroke-width": 0.8 }, frontNetCords));
    }

    function draw() {
      const t = spT.x;
      const normT = Math.max(0, Math.min(100, t)) / 100;

      // Parabolic flight trajectory:
      // Shooter at X = -22, Y = 16, Z = 14 (3-point arc)
      // Apex at X = -9, Y = 8, Z = 43
      // Rim target at X = 0, Y = 0.5, Z = 24.2
      // Floor drop at X = 0.5, Y = 0.5, Z = 3.5
      let bX, bY, bZ;
      if (normT <= 0.74) {
        const s = normT / 0.74;
        bX = -22 + s * (xCenter - (-22));
        bY = 16 + s * (yCenter - 16);
        const apexZ = 43.0;
        bZ = (1 - s) * (1 - s) * 14.0 + 2 * (1 - s) * s * (apexZ * 1.25) + s * s * 24.2;
      } else {
        const s = (normT - 0.74) / 0.26;
        bX = xCenter + Math.sin(s * Math.PI) * 0.4;
        bY = yCenter;
        bZ = 24.2 - s * 20.7; // Drops through rim down to floor
      }

      // Ball Screen Position
      const ballP = P(bX, bY, bZ);
      ballBody.setAttribute("cx", HL.r2(ballP[0]));
      ballBody.setAttribute("cy", HL.r2(ballP[1]));
      const rPix = 4.4;
      const bx = HL.r2(ballP[0]), by = HL.r2(ballP[1]);
      seamH.setAttribute("d", `M ${HL.r2(bx - rPix)} ${by} Q ${bx} ${HL.r2(by - rPix * 0.6)} ${HL.r2(bx + rPix)} ${by}`);
      seamV.setAttribute("d", `M ${bx} ${HL.r2(by - rPix)} Q ${HL.r2(bx + rPix * 0.6)} ${by} ${bx} ${HL.r2(by + rPix)}`);

      // Swish & Breakaway Trigger
      const isSwish = normT >= 0.72 && normT <= 0.84;
      if (isSwish) {
        const impact = Math.sin(((normT - 0.72) / 0.12) * Math.PI);
        spDeflect.t = impact * 8.5; // ~8.5° breakaway give on swish
        spNetFlutter.t = impact * 3.8; // Net flare
      } else if (dunkHoldTimer <= 0) {
        spDeflect.t = 0;
        spNetFlutter.t = 0;
      }

      // Compute Rim Points with Downward Deflection
      const theta = (spDeflect.x * Math.PI) / 180;
      const N = 32;
      const ptsOut = [], ptsIn = [];
      for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2;
        const xo = xCenter + rimRadiusOut * Math.cos(ang);
        const yo = yCenter + rimRadiusOut * Math.sin(ang);
        ptsOut.push(getDeflectedPoint(xo, yo, zHinge, theta));

        const xi = xCenter + rimRadiusIn * Math.cos(ang);
        const yi = yCenter + rimRadiusIn * Math.sin(ang);
        ptsIn.push(getDeflectedPoint(xi, yi, zHinge, theta));
      }

      // In world coords: ang from 0 to pi has sin(ang) >= 0 (Y >= yCenter: FRONT ARC)
      // ang from pi to 2pi has sin(ang) < 0 (Y < yCenter: REAR ARC)
      const frontPtsOut = ptsOut.slice(0, 17);
      const frontPtsIn = ptsIn.slice(0, 17).reverse();
      const frontRimPoly = [...frontPtsOut, ...frontPtsIn];
      frontRimPath.setAttribute("d", HL.poly(frontRimPoly));

      const rearPtsOut = ptsOut.slice(16).concat([ptsOut[0]]);
      const rearPtsIn = [ptsIn[0]].concat(ptsIn.slice(16).reverse());
      const rearRimPoly = [...rearPtsOut, ...rearPtsIn];
      rearRimPath.setAttribute("d", HL.poly(rearRimPoly));

      // Net Geometry: 12 loop diamond mesh in 4 tiers
      const flutter = spNetFlutter.x;
      const tiers = [
        { z: zHinge, r: (rimRadiusOut + rimRadiusIn) / 2, rot: 0 },
        { z: zHinge - 3.2, r: 5.2 + flutter * 0.6, rot: Math.PI / numLoops },
        { z: zHinge - 6.8, r: 4.2 + flutter * 1.2, rot: 0 },
        { z: zHinge - netHangLen, r: 3.4 + flutter * 1.6, rot: Math.PI / numLoops }
      ];

      const tierPoints = tiers.map(t => {
        const pts = [];
        for (let k = 0; k < numLoops; k++) {
          const ang = (k / numLoops) * Math.PI * 2 + t.rot;
          const x = xCenter + t.r * Math.cos(ang);
          const y = yCenter + t.r * Math.sin(ang);
          pts.push({
            p: getDeflectedPoint(x, y, t.z, theta),
            yMid: y
          });
        }
        return pts;
      });

      // Construct Diamond Segments
      let segIdx = 0;
      function setLine(idx, p1, p2, isFront) {
        if (idx >= maxNetSegs) return;
        const target = isFront ? frontLines[idx] : rearLines[idx];
        const other = isFront ? rearLines[idx] : frontLines[idx];
        target.setAttribute("x1", HL.r2(p1[0]));
        target.setAttribute("y1", HL.r2(p1[1]));
        target.setAttribute("x2", HL.r2(p2[0]));
        target.setAttribute("y2", HL.r2(p2[1]));
        other.setAttribute("x1", "0");
        other.setAttribute("y1", "0");
        other.setAttribute("x2", "0");
        other.setAttribute("y2", "0");
      }

      // Tier 0 -> Tier 1 (12 * 2 diagonals)
      for (let k = 0; k < numLoops; k++) {
        const p0 = tierPoints[0][k];
        const p1A = tierPoints[1][k];
        const p1B = tierPoints[1][(k + 1) % numLoops];
        const isF_A = (p0.yMid + p1A.yMid) / 2 >= yCenter;
        const isF_B = (p0.yMid + p1B.yMid) / 2 >= yCenter;
        setLine(segIdx++, p0.p, p1A.p, isF_A);
        setLine(segIdx++, p0.p, p1B.p, isF_B);
      }

      // Tier 1 -> Tier 2 (12 * 2 diagonals)
      for (let k = 0; k < numLoops; k++) {
        const p1 = tierPoints[1][k];
        const p2A = tierPoints[2][k];
        const p2B = tierPoints[2][(k + 1) % numLoops];
        const isF_A = (p1.yMid + p2A.yMid) / 2 >= yCenter;
        const isF_B = (p1.yMid + p2B.yMid) / 2 >= yCenter;
        setLine(segIdx++, p1.p, p2A.p, isF_A);
        setLine(segIdx++, p1.p, p2B.p, isF_B);
      }

      // Clear remaining lines
      while (segIdx < maxNetSegs) {
        frontLines[segIdx].setAttribute("x1", "0");
        frontLines[segIdx].setAttribute("y1", "0");
        frontLines[segIdx].setAttribute("x2", "0");
        frontLines[segIdx].setAttribute("y2", "0");
        rearLines[segIdx].setAttribute("x1", "0");
        rearLines[segIdx].setAttribute("y1", "0");
        rearLines[segIdx].setAttribute("x2", "0");
        rearLines[segIdx].setAttribute("y2", "0");
        segIdx++;
      }

      // Readout Status
      const curForce = Math.max(0, spDeflect.x * 58.5); // N
      const isBreakaway = spDeflect.x >= 3.0;
      if (isSwish) {
        read.textContent = `SWISH! CÚ NÉM CHÍNH XÁC · F_impact = ${curForce.toFixed(0)} N · Vành rổ nhún ${spDeflect.x.toFixed(1)}°`;
      } else if (isBreakaway) {
        read.textContent = `FIBA SLAM-DUNK BREAKAWAY: F = ${curForce.toFixed(0)} N (≥ 805 N) · Vành rổ gập -${spDeflect.x.toFixed(1)}°`;
      } else {
        read.textContent = `TIẾN TRÌNH NÉM: ${(normT * 100).toFixed(0)}% · Tọa độ bóng Z = ${bZ.toFixed(1)} cm · Vành rổ FIBA cân bằng`;
      }
    }

    function setShot(val) {
      spT.t = HL.clamp(val, 0, 100);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setShot(50);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setShot(norm * 100.0);
    }

    // Slam-Dunk test trigger on click/pointerdown
    function onRimClick() {
      spDeflect.t = 16.5; // Deflect down 16.5 degrees (~965 N dunk force)
      spNetFlutter.t = 4.5;
      dunkHoldTimer = 0.6; // Hold for 0.6s
      reg.wake();
    }

    stage.addEventListener("pointerdown", onRimClick);
    bag.add(() => stage.removeEventListener("pointerdown", onRimClick));

    const reg = HL.register(stage, dt => {
      if (dunkHoldTimer > 0) {
        dunkHoldTimer -= dt;
        if (dunkHoldTimer <= 0) {
          spDeflect.t = 0;
          spNetFlutter.t = 0;
        }
      }
      const moving = HL.stepS(spT, dt) | HL.stepS(spDeflect, dt) | HL.stepS(spNetFlutter, dt) | (dunkHoldTimer > 0 ? 1 : 0);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setShot(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
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

  let currentIndex = 0;
  let currentHandle = null;

  function formatReadout(str) {
    if (!str) return "rest";
    if (str.length <= 24) return str;
    const br = str.match(/\[(.*?)\]/);
    const eq = str.match(/[a-zA-Z_θ°\u0394][a-zA-Z_0-9°]*\s*=\s*[^·\n⇒=()]{1,12}/g);
    if (br && eq) {
      const tag = br[1].replace(/HOÀN HẢO|- KÍN|- HỞ/g, "").trim();
      return (tag + " · " + eq[0].trim()).slice(0, 24);
    }
    if (eq && eq.length >= 2) {
      return (eq[0].trim() + " · " + eq[1].trim()).slice(0, 24);
    }
    if (eq) return eq[0].trim().slice(0, 24);
    if (br) return br[1].slice(0, 24);
    const parts = str.split(":");
    if (parts.length > 1) return parts[1].trim().slice(0, 24);
    return str.slice(0, 24);
  }

  const readBridge = {
    get textContent() { return readEl.textContent; },
    set textContent(v) {
      if (!v) { readEl.textContent = "rest"; return; }
      const str = String(v);
      readEl.textContent = formatReadout(str);
      meansEl.textContent = str;
    }
  };

  function renderTabs() {
    navTabs.innerHTML = "";
    PE_FIGURES.forEach((fig, idx) => {
      const btn = document.createElement("button");
      btn.className = "nav-btn" + (idx === currentIndex ? " active" : "");
      btn.textContent = (idx + 1) + ". " + fig.id.replace(/^pe-/, "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
      btn.onclick = () => switchTo(idx);
      navTabs.appendChild(btn);
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
