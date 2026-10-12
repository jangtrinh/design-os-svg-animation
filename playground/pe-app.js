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
 * Physical Concept: Đo thời lượng điền kinh cự ly ngắn (Sprint timing):
 *   - Mặt số chia vạch 60 giây, kim quét cơ học êm ái.
 *   - Vận tốc trung bình cự ly chạy 100m: v = 100 / t (m/s).
 *   - Kỷ lục thế giới 100m: Usain Bolt 9.58s (v_max ≈ 10.44 m/s).
 * Geometry: Thân vỏ kim loại mạ crom tròn đặc (100% opaque), vành bezel vát,
 *   núm bấm đỉnh (Crown pusher), 2 núm bấm phụ hai bên vai, mặt số 60 vạch khắc,
 *   kim giây thanh mảnh có đối trọng đuôi tròn.
 * Kinematics: Di chuột điều chỉnh kim giây quét từ 0 đến 30 giây hoặc bấm núm;
 *   kim giây lướt mượt mà qua các vạch chia, núm đỉnh nhún đàn hồi và kích hoạt .hi.
 */

{
  id: "pe-stopwatch",
  title: "1. Đồng Hồ Bấm Giờ (Sports Stopwatch)",
  concept: "Đo thời gian điền kinh: v = s / t · Độ chính xác 1/100 s · Tính vận tốc chạy 100m",
  means: "Di chuột điều khiển kim giây quét trên mặt đồng hồ bấm giờ thể thao. Thời gian trôi theo từng phần trăm giây và vận tốc trung bình cự ly 100m tương ứng được tính toán tức thì.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 9.58, 30],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Bench Mat Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. Stopwatch Case (Cylindrical solid at 0, 0, Z: 2.5 to 7.5)
    const caseR = 15.5;
    const caseSol = HL.solid(svg);
    HL.put(caseSol, HL.prism(P, front, HL.circ(caseR, 32), HL.circ(caseR - 0.8, 32), 2.5, 7.5));

    // Bezel ring (Z: 7.5 to 8.8, radius 14.5)
    const bezelSol = HL.solid(svg);
    HL.put(bezelSol, HL.prism(P, front, HL.circ(14.5, 32), HL.circ(13.8, 32), 7.5, 8.8));

    // Dial face disc (solid polygon at Z = 8.8, radius 13.8)
    const dialFace = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, svg);
    const dialPts = [];
    for (let a = 0; a < 32; a++) {
      const ang = (a * 2 * Math.PI) / 32;
      dialPts.push(P(13.8 * Math.cos(ang), 13.8 * Math.sin(ang), 8.8));
    }
    dialFace.setAttribute("d", HL.poly(dialPts));

    // 3. Dial Scale Markings (60 ticks around dial)
    const dialGroup = HL.mk("g", {}, svg);
    for (let s = 0; s < 60; s++) {
      const ang = (s * 6 * Math.PI) / 180 - Math.PI / 2; // 0s at top (-Y)
      const isMajor = s % 5 === 0;
      const rOut = 13.2;
      const rIn = isMajor ? 11.0 : 12.2;
      const pOut = P(rOut * Math.cos(ang), rOut * Math.sin(ang), 8.9);
      const pIn = P(rIn * Math.cos(ang), rIn * Math.sin(ang), 8.9);
      HL.mk("line", {
        x1: HL.r2(pIn[0]), y1: HL.r2(pIn[1]),
        x2: HL.r2(pOut[0]), y2: HL.r2(pOut[1]),
        class: isMajor ? "hi" : "lo",
        "stroke-width": isMajor ? 1.2 : 0.6
      }, dialGroup);
    }

    // Small sub-dial (30-minute register at upper center (0, -6, 8.9))
    const subPts = [];
    for (let a = 0; a < 20; a++) {
      const ang = (a * 2 * Math.PI) / 20;
      subPts.push(P(3.2 * Math.cos(ang), -6.0 + 3.2 * Math.sin(ang), 8.9));
    }
    HL.mk("path", { d: HL.poly(subPts), class: "lo", "stroke-width": 0.8 }, dialGroup);

    // 4. Crown Pusher at 12 o'clock (Y = -15.5 to -19.5, Z = 5.0)
    const crownGroup = HL.mk("g", {}, svg);
    const crownSol = HL.solid(crownGroup);
    // Shoulder pushers at 10h and 2h
    const btnL = HL.mk("line", {
      x1: HL.r2(P(-11, -11, 5.0)[0]), y1: HL.r2(P(-11, -11, 5.0)[1]),
      x2: HL.r2(P(-14, -14, 5.0)[0]), y2: HL.r2(P(-14, -14, 5.0)[1]),
      class: "sil", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, crownGroup);
    const btnR = HL.mk("line", {
      x1: HL.r2(P(11, -11, 5.0)[0]), y1: HL.r2(P(11, -11, 5.0)[1]),
      x2: HL.r2(P(14, -14, 5.0)[0]), y2: HL.r2(P(14, -14, 5.0)[1]),
      class: "sil", "stroke-width": 2.2, stroke: "var(--hl-edge)"
    }, crownGroup);

    // 5. Sweeping Hands
    const handGroup = HL.mk("g", {}, svg);
    const secHand = HL.mk("line", { class: "hi", "stroke-width": 1.4 }, handGroup);
    const counterTail = HL.mk("line", { class: "lo", "stroke-width": 1.4 }, handGroup);
    const centerCap = HL.mk("circle", { cx: HL.r2(P(0, 0, 9.2)[0]), cy: HL.r2(P(0, 0, 9.2)[1]), r: 1.6, class: "dot" }, handGroup);

    // Kinematics Springs
    const initialT = initialV != null ? initialV : 9.58;
    const spTime = HL.spring(initialT, { k: 130, c: 14 });
    const spPusher = HL.spring(0, { k: 200, c: 16 });

    function draw() {
      const curT = spTime.x; // seconds (0 to 30)
      const push = spPusher.x;

      // Crown Pusher Depress along -Y
      const crY0 = -15.5;
      const crY1 = -18.5 + push * 1.5;
      const [crO, crI] = HL.rings(-2.5, crY1, 2.5, crY0, 0.6, 0.2);
      HL.put(crownSol, HL.prism(P, front, crO, crI, 4.0, 6.0));

      // Hand Angle: 60s per full 360 deg
      // 0s at -Y (12 o'clock) -> angle = -Math.PI / 2
      const ang = (curT * 6 * Math.PI) / 180 - Math.PI / 2;
      const tipR = 12.0;
      const tailR = 3.5;

      const pTip = P(tipR * Math.cos(ang), tipR * Math.sin(ang), 9.0);
      const pTail = P(-tailR * Math.cos(ang), -tailR * Math.sin(ang), 9.0);
      const pCenter = P(0, 0, 9.0);

      secHand.setAttribute("x1", HL.r2(pCenter[0]));
      secHand.setAttribute("y1", HL.r2(pCenter[1]));
      secHand.setAttribute("x2", HL.r2(pTip[0]));
      secHand.setAttribute("y2", HL.r2(pTip[1]));

      counterTail.setAttribute("x1", HL.r2(pCenter[0]));
      counterTail.setAttribute("y1", HL.r2(pCenter[1]));
      counterTail.setAttribute("x2", HL.r2(pTail[0]));
      counterTail.setAttribute("y2", HL.r2(pTail[1]));

      // Header Readout
      const secStr = HL.r2(curT);
      const vAvg = curT > 0.5 ? HL.r2(100.0 / curT) : 0;
      const isWR = Math.abs(curT - 9.58) < 0.2;

      if (isWR) {
        read.textContent = `Bấm giờ: t = ${secStr}s (Kỷ lục thế giới 100m: 9.58s) · Vận tốc trung bình v = ${vAvg} m/s (37.6 km/h) (.hi)`;
      } else {
        read.textContent = `Bấm giờ: t = ${secStr}s · Vận tốc cự ly 100m: v = ${vAvg} m/s · Đo thời gian chính xác 1/100s`;
      }
    }

    function setTime(val) {
      spTime.t = HL.clamp(val, 0, 30);
      spPusher.t = 1.0;
      setTimeout(() => { spPusher.t = 0.0; }, 120);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setTime(9.58);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setTime(norm * 30.0);
    }

    const reg = HL.register(stage, dt => {
      const m1 = HL.stepS(spTime, dt);
      const m2 = HL.stepS(spPusher, dt);
      draw();
      return m1 || m2;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setTime(Number(v));
      },
      destroy: bag.dispose
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
 *   - Vùng trao gậy tiêu chuẩn World Athletics (WA): Chiều dài 20m (từ -10m đến +10m quanh mốc chuẩn).
 *   - Trao gậy trong vùng: Hợp lệ ([VALID] - kích hoạt trạng thái .hi).
 *   - Trao gậy ngoài vùng: Phạm quy tức thì ([DISQUALIFIED - DQ]).
 *   - Đồng bộ vận tốc: VĐV số 1 và số 2 phải đạt vận tốc tiệm cận v ≈ 11.2 m/s tại thời điểm trao gậy.
 * Geometry: Đoạn đường chạy điền kinh tartan đặc, vạch phân làn trắng, vạch vàng giới hạn vùng 20m,
 *   mũi tên chevron tâm vùng; gậy tiếp sức bằng hợp kim nhôm dạng trụ tròn đặc 3D 100% opaque.
 * Kinematics: Di chuột kéo vị trí trao gậy dọc làn chạy (-25m -> +25m); gậy trượt êm ái,
 *   nhún nhẹ theo quán tính bước chạy, bóng đổ trên mặt đường, hiển thị trạng thái hợp lệ/phạm quy.
 */

{
  id: "pe-relay-baton",
  title: "3. Gậy Tiếp Sức (Relay Baton & Track)",
  concept: "Điền kinh 4x100m: Vùng trao gậy 20m · Quy tắc hợp lệ vs Phạm quy (DQ)",
  means: "Di chuột di chuyển vị trí trao gậy dọc đường chạy (-25m đến +25m). Trạng thái [HỢP LỆ] kích hoạt khi gậy nằm trọn vẹn trong vùng 20m, cảnh báo [DQ] khi rơi ra ngoài.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, 0, 20],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 35]], 200, 160);
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

    // 2. Takeover Zone Markings (from X = -15 to +15, representing 20m zone)
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

    // 4. 3D Cylindrical Relay Baton (Gậy tiếp sức dạng trụ tròn đặc 3D 100% opaque)
    const batonGroup = HL.mk("g", {}, svg);
    const batonBody = HL.mk("polygon", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, batonGroup);
    const batonBand = HL.mk("polygon", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.0 }, batonGroup);
    const batonCapTop = HL.mk("ellipse", { class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, batonGroup);
    const batonCapBot = HL.mk("ellipse", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, batonGroup);

    // Kinematics Springs
    const initialPos = initialV != null ? initialV : 0;
    const spPos = HL.spring(initialPos, { k: 130, c: 14 });

    function draw() {
      const x = spPos.x; // -25 to +25
      const isInZone = x >= zoneEntryX && x <= zoneExitX;

      // Baton Geometry in 3D:
      // Tilted forward in running direction: length 20, radius 2.6, center at (x, 0, 11.5)
      const bLen = 22.0;
      const bRad = 2.6;
      const bAng = (30 * Math.PI) / 180; // Slanted 30 deg forward in X-Z plane
      const bCenter = [x, 0.0, 12.0];

      const cosB = Math.cos(bAng), sinB = Math.sin(bAng);
      const e0_3D = [bCenter[0] - (bLen / 2) * cosB, bCenter[1], bCenter[2] - (bLen / 2) * sinB]; // Lower end
      const e1_3D = [bCenter[0] + (bLen / 2) * cosB, bCenter[1], bCenter[2] + (bLen / 2) * sinB]; // Upper end

      const p0 = P(e0_3D[0], e0_3D[1], e0_3D[2]);
      const p1 = P(e1_3D[0], e1_3D[1], e1_3D[2]);

      // Projected vector from p0 to p1
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      const len2D = Math.hypot(dx, dy);
      const nx = -dy / len2D;
      const ny = dx / len2D;

      // Radius in 2D pixels
      const rPix = bRad * 1.85;

      // 4 corners of cylinder body
      const c0L = [p0[0] + nx * rPix, p0[1] + ny * rPix];
      const c0R = [p0[0] - nx * rPix, p0[1] - ny * rPix];
      const c1L = [p1[0] + nx * rPix, p1[1] + ny * rPix];
      const c1R = [p1[0] - nx * rPix, p1[1] - ny * rPix];

      batonBody.setAttribute("points", `${HL.r2(c0L[0])},${HL.r2(c0L[1])} ${HL.r2(c1L[0])},${HL.r2(c1L[1])} ${HL.r2(c1R[0])},${HL.r2(c1R[1])} ${HL.r2(c0R[0])},${HL.r2(c0R[1])}`);

      // Contrast band in middle (from 40% to 60% of length)
      const b0 = [p0[0] + dx * 0.4, p0[1] + dy * 0.4];
      const b1 = [p0[0] + dx * 0.6, p0[1] + dy * 0.6];
      const b0L = [b0[0] + nx * rPix, b0[1] + ny * rPix];
      const b0R = [b0[0] - nx * rPix, b0[1] - ny * rPix];
      const b1L = [b1[0] + nx * rPix, b1[1] + ny * rPix];
      const b1R = [b1[0] - nx * rPix, b1[1] - ny * rPix];
      batonBand.setAttribute("points", `${HL.r2(b0L[0])},${HL.r2(b0L[1])} ${HL.r2(b1L[0])},${HL.r2(b1L[1])} ${HL.r2(b1R[0])},${HL.r2(b1R[1])} ${HL.r2(b0R[0])},${HL.r2(b0R[1])}`);

      // End caps ellipses
      batonCapTop.setAttribute("cx", HL.r2(p1[0]));
      batonCapTop.setAttribute("cy", HL.r2(p1[1]));
      batonCapTop.setAttribute("rx", HL.r2(rPix));
      batonCapTop.setAttribute("ry", HL.r2(rPix * 0.5));

      batonCapBot.setAttribute("cx", HL.r2(p0[0]));
      batonCapBot.setAttribute("cy", HL.r2(p0[1]));
      batonCapBot.setAttribute("rx", HL.r2(rPix));
      batonCapBot.setAttribute("ry", HL.r2(rPix * 0.5));

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
      const mStr = HL.r2(x * (20 / 30)); // Scale to meters (-13.3m to +13.3m)
      if (isInZone) {
        read.textContent = `Tiếp sức 4x100m: Vị trí gậy X = ${mStr}m · [HỢP LỆ] Đang trong vùng trao gậy 20m · Duy trì vận tốc v ≈ 11.2 m/s (.hi)`;
      } else if (x < zoneEntryX) {
        read.textContent = `Tiếp sức 4x100m: Vị trí gậy X = ${mStr}m · [CHƯA VÀO VÙNG] Cự ly tiếp cận, người nhận tăng tốc`;
      } else {
        read.textContent = `Tiếp sức 4x100m: Vị trí gậy X = ${mStr}m · [PHẠM QUY - DQ] Vượt quá giới hạn vùng trao gậy 20m!`;
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
 * 5. Basketball Breakaway Rim & Trajectory (Vành Rổ & Quỹ Đạo Bóng)
 * Physical Concept: Cơ chế vành rổ đàn hồi FIBA (Breakaway Rim) & Quỹ đạo ném parabol:
 *   - Bảng rổ tiêu chuẩn: Kích thước 180cm x 105cm, ô chữ nhật định vị 59cm x 45cm.
 *   - Vành rổ giảm chấn lò xo: Hấp thụ xung lực ném/dunk (F ≥ 82N - 105N, gập tối đa 30° rồi nhún nảy về ban đầu).
 *   - Quỹ đạo ném rổ: Điểm phát bóng bay theo parabol y(x), bóng lọt vành rổ làm lưới rung và vành rổ nhún mạnh.
 * Geometry: Bảng kính/gỗ đặc gắn trên trụ thép chữ L, vành rổ kim loại dạng xuyến đặc có hộp lò xo,
 *   lưới rủ đa giác đặc, quả bóng rổ đặc với các đường gân nổi (100% opaque, không nhìn xuyên).
 * Kinematics: Di chuột điều chỉnh tiến trình ném bóng (0% -> 100%); bóng bay theo parabol rơi đúng tâm rổ;
 *   khi lọt rổ, vành rổ nhún đàn hồi k=160, c=10, lưới rủ rung lắc và header hiển thị trạng thái SWISH / SCORE!
 */

{
  id: "pe-basketball-hoop",
  title: "5. Vành Rổ & Đàn Hồi (FIBA Breakaway Rim)",
  concept: "Cơ chế vành rổ giảm chấn FIBA · Lò xo hấp thụ xung lực dunk F ≥ 82 N · Quỹ đạo parabol",
  means: "Di chuột điều khiển quỹ đạo ném bóng (0% - 100%). Bóng bay vồng theo parabol lọt vào tâm rổ làm vành rổ nhún đàn hồi cực nảy và lưới rung sống động.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 50, 100],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-45, -25, 0], [45, 25, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Court Ground Platform (Sân bóng rổ Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-42, -18, 42, 18, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Free-throw key arc on the court surface
    const arcPoints = [];
    for (let a = -90; a <= 90; a += 15) {
      const rad = (a * Math.PI) / 180;
      const x = -10 + 12 * Math.cos(rad);
      const y = 12 * Math.sin(rad);
      arcPoints.push(P(x, y, 2.6));
    }
    HL.mk("path", {
      d: "M " + arcPoints.map(p => `${HL.r2(p[0])} ${HL.r2(p[1])}`).join(" L "),
      class: "lo",
      fill: "none",
      stroke: "var(--hl-edge)",
      "stroke-dasharray": "2,2"
    }, svg);

    // 2. Heavy Back Pole & Cantilever Support (Trụ đỡ rổ kiên cố phía sau)
    // Pole at X = 28, Y = 0, Z = 2.5 to 30.0
    const poleSol = HL.solid(svg);
    const [poleO, poleI] = HL.rings(25.5, -2.5, 30.5, 2.5, 1.0, 0.3);
    HL.put(poleSol, HL.prism(P, front, poleO, poleI, 2.5, 30.0));

    // Cantilever boom extending from pole (X=28) forward to backboard (X=14) at Z = 26 to 29
    const boomSol = HL.solid(svg);
    const [bmO, bmI] = HL.rings(14.0, -1.8, 28.0, 1.8, 0.8, 0.3);
    HL.put(boomSol, HL.prism(P, front, bmO, bmI, 26.5, 29.0));

    // 3. Backboard (Bảng rổ đặc tại X = 13.0 to 14.2, Y = -16 to +16, Z = 20.0 to 36.0)
    const boardSol = HL.solid(svg);
    const [bdO, bdI] = HL.rings(13.0, -16.0, 14.2, 16.0, 0.6, 0.2);
    HL.put(boardSol, HL.prism(P, front, bdO, bdI, 20.0, 36.0));

    // Inner targeting box on front of backboard (Y = -5.5 to +5.5, Z = 22.0 to 28.0 at X = 12.9)
    const boxPts = [
      P(12.9, -5.5, 22.0),
      P(12.9, 5.5, 22.0),
      P(12.9, 5.5, 28.0),
      P(12.9, -5.5, 28.0)
    ];
    HL.mk("polygon", {
      points: boxPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "),
      class: "hi",
      fill: "none",
      stroke: "var(--hl-edge)",
      "stroke-width": 1.2
    }, svg);

    // 4. Rim Mounting Bracket / Spring Housing (Hộp lò xo gắn vành rổ X = 11.2 to 13.0, Y = -2.0 to 2.0, Z = 22.2 to 24.2)
    const bracketSol = HL.solid(svg);
    const [brO, brI] = HL.rings(11.2, -2.0, 13.0, 2.0, 0.5, 0.2);
    HL.put(bracketSol, HL.prism(P, front, brO, brI, 22.2, 24.2));

    // 5. Dynamic Breakaway Rim & Net Assembly
    const hoopAssembly = HL.mk("g", {}, svg);
    const netPath = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, hoopAssembly);
    const netLinesGroup = HL.mk("g", { class: "lo" }, hoopAssembly);
    const netRibs = [];
    for (let r = 0; r < 8; r++) {
      const line = HL.mk("line", { stroke: "var(--hl-edge)", "stroke-width": 0.8 }, netLinesGroup);
      netRibs.push(line);
    }
    const rimPath = HL.mk("path", { class: "hi", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, hoopAssembly);

    // 6. Basketball (Quả bóng rổ đặc bay dọc quỹ đạo)
    const ballGroup = HL.mk("g", {}, svg);
    const ballBody = HL.mk("circle", { r: 4.2, fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, ballGroup);
    const seamH = HL.mk("path", { fill: "none", stroke: "var(--hl-edge)", class: "lo" }, ballGroup);
    const seamV = HL.mk("path", { fill: "none", stroke: "var(--hl-edge)", class: "lo" }, ballGroup);

    // Dynamic Kinematics Springs
    const initialT = initialV != null ? initialV : 0;
    const spT = HL.spring(initialT, { k: 100, c: 14 }); // Shot progress 0% to 100%
    const spRimDeflect = HL.spring(0, { k: 180, c: 10 }); // Breakaway rim downward deflection (degrees)
    const spNetFlutter = HL.spring(0, { k: 140, c: 12 }); // Net ripple expansion factor

    // Geometry parameters for rim: center at (X = 4.5, Y = 0), nominal Z = 23.5, radius = 6.0
    const rimCenterX = 4.5;
    const rimRadius = 6.0;
    const rimNominalZ = 23.5;
    const hingeX = 11.2;

    function draw() {
      const t = spT.x; // 0 to 100%
      const normT = Math.max(0, Math.min(100, t)) / 100;

      // Parabolic flight trajectory for the ball:
      // Start at X = -32, Y = 0, Z = 14 (Shooter release point)
      // Peak apex at X = -10, Y = 0, Z = 37.0
      // Swish target at rim center: X = 4.5, Y = 0, Z = 23.5
      // Follow-through falling point: X = 4.5, Y = 0, Z = 6.0 (hitting court)
      let ballX, ballY = 0, ballZ;
      if (normT <= 0.75) {
        const f = normT / 0.75;
        ballX = -32 + f * (rimCenterX - (-32));
        const apexH = 37.0;
        const z0 = 14.0;
        const z1 = rimNominalZ;
        ballZ = (1 - f) * (1 - f) * z0 + 2 * (1 - f) * f * (apexH * 1.25) + f * f * z1;
      } else {
        const f = (normT - 0.75) / 0.25;
        ballX = rimCenterX + (Math.sin(f * Math.PI) * 0.8);
        ballZ = rimNominalZ - f * 17.5;
      }

      // Ball screen position
      const ballP = P(ballX, ballY, ballZ);
      ballBody.setAttribute("cx", HL.r2(ballP[0]));
      ballBody.setAttribute("cy", HL.r2(ballP[1]));

      // Seam curves on the ball (projected arc ellipses)
      const rPix = 4.2;
      const arcW = HL.r2(ballP[0]);
      const arcH = HL.r2(ballP[1]);
      seamH.setAttribute("d", `M ${HL.r2(arcW - rPix)} ${arcH} Q ${arcW} ${HL.r2(arcH - rPix * 0.6)} ${HL.r2(arcW + rPix)} ${arcH}`);
      seamV.setAttribute("d", `M ${arcW} ${HL.r2(arcH - rPix)} Q ${HL.r2(arcW + rPix * 0.6)} ${arcH} ${arcW} ${HL.r2(arcH + rPix)}`);

      // Collision trigger with Rim & Net:
      if (normT >= 0.72 && normT <= 0.82) {
        const impact = Math.sin(((normT - 0.72) / 0.10) * Math.PI);
        spRimDeflect.t = impact * 8.5; // Deflect down 8.5 degrees
        spNetFlutter.t = impact * 2.8; // Net expands outward
      } else {
        spRimDeflect.t = 0;
        spNetFlutter.t = 0;
      }

      // 1. Draw Breakaway Rim (Tilted downward by angle theta)
      const theta = (spRimDeflect.x * Math.PI) / 180;
      const rimPts = [];
      const numPts = 16;
      for (let a = 0; a < 360; a += 360 / numPts) {
        const rad = (a * Math.PI) / 180;
        const localX = rimRadius * Math.cos(rad);
        const localY = rimRadius * Math.sin(rad);
        const dx = (rimCenterX + localX) - hingeX;
        const curX = hingeX + dx * Math.cos(theta);
        const curZ = rimNominalZ - dx * Math.sin(theta);
        const curY = localY;
        rimPts.push(P(curX, curY, curZ));
      }
      rimPath.setAttribute("d", HL.poly(rimPts));

      // 2. Draw Net (Frustum hanging below rim)
      const netBottomZ = rimNominalZ - 9.0;
      const flutter = spNetFlutter.x;
      const netBottomRadius = 3.2 + flutter * 0.9;
      const netBotPts = [];
      for (let a = 0; a < 360; a += 360 / numPts) {
        const rad = (a * Math.PI) / 180;
        const bx = rimCenterX + netBottomRadius * Math.cos(rad);
        const by = netBottomRadius * Math.sin(rad);
        const bz = netBottomZ - (theta * 8.0);
        netBotPts.push(P(bx, by, bz));
      }

      // Net silhouette: outer contour connecting top rim to bottom rim
      // Top rim left/right extrema and bottom rim left/right extrema
      const topPts2D = rimPts;
      const botPts2D = netBotPts;
      // Convex hull / boundary polygon: top arc + right side + bot arc (reversed) + left side
      const netPolyPts = [...topPts2D, ...botPts2D.slice().reverse()];
      netPath.setAttribute("d", HL.poly(netPolyPts));

      // Net ribs (rib lines from top rim to bottom rim)
      for (let r = 0; r < netRibs.length; r++) {
        const idx = r * 2;
        const tp = topPts2D[idx];
        const bp = botPts2D[idx];
        netRibs[r].setAttribute("x1", HL.r2(tp[0]));
        netRibs[r].setAttribute("y1", HL.r2(tp[1]));
        netRibs[r].setAttribute("x2", HL.r2(bp[0]));
        netRibs[r].setAttribute("y2", HL.r2(bp[1]));
      }

      // Readout Status
      const isGoal = normT >= 0.72 && normT <= 0.88;
      const rimForce = (spRimDeflect.x * 12.5).toFixed(0);
      read.textContent = isGoal
        ? `SWISH! CÚ NÉM CHÍNH XÁC · F_impact = ${rimForce} N · Vành rổ đàn hồi nhún ${spRimDeflect.x.toFixed(1)}°`
        : `TIẾN TRÌNH NÉM: ${(normT * 100).toFixed(0)}% · Tọa độ bóng Z = ${ballZ.toFixed(1)} cm · Vành rổ FIBA cân bằng`;
      
      if (isGoal) {
        rimPath.classList.add("hi");
        rimPath.classList.remove("lo");
      } else {
        rimPath.classList.remove("hi");
        rimPath.classList.add("lo");
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

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spT, dt) | HL.stepS(spRimDeflect, dt) | HL.stepS(spNetFlutter, dt);
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
