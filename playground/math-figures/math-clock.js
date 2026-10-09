/*
 * 7. Teaching Clock (Mặt Đồng Hồ Học Giờ)
 * Pedagogical Goal: Telling time & 12:1 gear ratio
 * Simplified Geometry: Clean circular clock bezel on an angled stand with 12 hour ticks
 * Meaningful Interaction: Circling pointer smoothly drives minute hand; hour hand follows with exact 12:1 ratio
 */

export default {
  id: "math-clock",
  title: "7. Mặt Đồng Hồ Học Giờ (Teaching Clock)",
  concept: "Xem giờ đúng & tỷ lệ bánh răng 12:1",
  means: "Đồng hồ để bàn tinh giản: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1, hiển thị 12 cọc giờ rõ ràng trực quan.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 3, 12],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-44, -44, 0], [44, 44, 18]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Bezel Body (Z: 0 to 6)
    const [bezelO, bezelI] = HL.rings(-36, -36, 36, 36, 36, 2.5);
    const bezelSol = HL.solid(svg);
    HL.put(bezelSol, HL.prism(P, front, bezelO, bezelI, 0, 6));

    // Dial face rim line
    const dialRim = HL.mk("ellipse", {
      rx: HL.r2(33.0 * C.S), ry: HL.r2(33.0 * C.S * C.k),
      class: "lo nf"
    }, svg);
    const centerScr = P(0, 0, 6.2);
    dialRim.setAttribute("cx", HL.r2(centerScr[0]));
    dialRim.setAttribute("cy", HL.r2(centerScr[1]));

    // 2. 12 Clear Hour Ticks (No SVG Text)
    let marker12El;
    for (let h = 1; h <= 12; h++) {
      const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
      const phi = alpha - Math.PI / 4;
      const isCardinal = (h % 3 === 0);
      const is12 = (h === 12);

      const r1 = is12 ? 24.0 : (isCardinal ? 26.0 : 28.0);
      const r2 = 32.5;

      const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 6.3);
      const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 6.3);

      const tLine = HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        stroke: (is12 || isCardinal ? "#111113" : "#6f6f78"),
        "stroke-width": (is12 ? 2.0 : (isCardinal ? 1.5 : 1.0)),
        class: (is12 ? "hi" : "")
      }, svg);

      if (is12) marker12El = tLine;
    }

    // 3. Hands: Short & Broad Hour Hand, Long & Slender Minute Hand
    const hourPoly = HL.mk("polygon", {
      style: "fill: #232327; stroke: #111113; stroke-width: 1.0; stroke-linejoin: round;"
    }, svg);

    const minutePoly = HL.mk("polygon", {
      style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;"
    }, svg);

    // Center Axle Pin
    const centerPin = HL.mk("ellipse", {
      rx: HL.r2(2.5 * C.S), ry: HL.r2(2.5 * C.S * C.k),
      fill: "#232327", stroke: "none"
    }, svg);
    centerPin.setAttribute("cx", HL.r2(centerScr[0]));
    centerPin.setAttribute("cy", HL.r2(centerScr[1]));

    const startHour = initialV != null ? HL.clamp(initialV, 0, 12) : 3;
    const minuteAngleSp = HL.spring((startHour % 1) * Math.PI * 2, { k: 140, c: 14 });
    let totalMinutes = startHour * 60;
    let active = false;

    function draw() {
      const mRad = minuteAngleSp.x;
      const hRad = (totalMinutes / 720) * Math.PI * 2;

      const mPhi = mRad - Math.PI / 2 - Math.PI / 4;
      const hPhi = hRad - Math.PI / 2 - Math.PI / 4;

      const zH = 6.6;
      const zM = 7.0;

      // Minute hand: length 25, width 2.0
      const mCos = Math.cos(mPhi), mSin = Math.sin(mPhi);
      const mPerpX = -mSin, mPerpY = mCos;
      const mPts = [
        P(mCos * 25.0, mSin * 25.0, zM),
        P(mCos * 2.5 + mPerpX * 1.6, mSin * 2.5 + mPerpY * 1.6, zM),
        P(-mCos * 4.5, -mSin * 4.5, zM),
        P(mCos * 2.5 - mPerpX * 1.6, mSin * 2.5 - mPerpY * 1.6, zM)
      ];
      minutePoly.setAttribute("points", mPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Hour hand: length 16, width 3.0
      const hCos = Math.cos(hPhi), hSin = Math.sin(hPhi);
      const hPerpX = -hSin, hPerpY = hCos;
      const hPts = [
        P(hCos * 16.0, hSin * 16.0, zH),
        P(hCos * 2.5 + hPerpX * 2.4, hSin * 2.5 + hPerpY * 2.4, zH),
        P(-hCos * 3.5, -hSin * 3.5, zH),
        P(hCos * 2.5 - hPerpX * 2.4, hSin * 2.5 - hPerpY * 2.4, zH)
      ];
      hourPoly.setAttribute("points", hPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      if (marker12El) marker12El.classList.toggle("hi", !active);
      minutePoly.classList.toggle("hi", active);

      const hrs = Math.floor((totalMinutes % 720) / 60) || 12;
      const mins = Math.floor(totalMinutes % 60);
      const minStr = mins < 10 ? "0" + mins : mins;
      read.textContent = "Đồng hồ: " + hrs + ":" + minStr + " (Kim phút quay 1 vòng 360° = Kim giờ nhích 1 số)";
    }

    let lastAimAngle = null;

    function aim(pt) {
      if (!pt) {
        active = false;
        lastAimAngle = null;
        reg.wake();
        return;
      }
      const dx = pt[0] - centerScr[0];
      const dy = pt[1] - centerScr[1];
      const dist = Math.hypot(dx, dy);

      if (dist < 10 || dist > 110) return;

      active = true;
      let angle = Math.atan2(dy, dx) + Math.PI / 4 + Math.PI / 2;
      while (angle < 0) angle += Math.PI * 2;
      while (angle >= Math.PI * 2) angle -= Math.PI * 2;

      if (lastAimAngle != null) {
        let diff = angle - lastAimAngle;
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;

        totalMinutes += (diff / (Math.PI * 2)) * 60;
        if (totalMinutes < 0) totalMinutes += 720;
      }
      lastAimAngle = angle;

      minuteAngleSp.t = angle;
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(minuteAngleSp, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        totalMinutes = HL.clamp(v, 0, 12) * 60;
        const targetAng = ((totalMinutes % 60) / 60) * Math.PI * 2;
        minuteAngleSp.t = targetAng;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
