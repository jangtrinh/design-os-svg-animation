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

export default {
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
};
