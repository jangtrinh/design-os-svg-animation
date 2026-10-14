/*
 * 7. Teaching Clock (Mặt Đồng Hồ Học Giờ)
 * Pedagogical Goal: Telling time & 12:1 gear ratio
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.4);
    HL.fit(C, [[-38, -38, 0], [38, 38, 14]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Desk Stand Base (Z: 0 to 3.5) & Clock Bezel Body (Z: 3.5 to 11.5)
    const [standO, standI] = HL.rings(-26, -16, 26, 16, 3.0, 0.8);
    const standSol = HL.solid(svg);
    HL.put(standSol, HL.prism(P, front, standO, standI, 0, 3.5));

    const [bezelO, bezelI] = HL.rings(-36, -36, 36, 36, 36, 2.5);
    const bezelSol = HL.solid(svg);
    HL.put(bezelSol, HL.prism(P, front, bezelO, bezelI, 3.5, 11.5));

    // Dial face rim line
    const dialZ = 11.7;
    const centerScr = P(0, 0, dialZ);
    HL.mk("ellipse", {
      cx: HL.r2(centerScr[0]), cy: HL.r2(centerScr[1]),
      rx: HL.r2(33.0 * C.S), ry: HL.r2(33.0 * C.S * C.k),
      class: "lo nf"
    }, svg);

    // 2. 12 Clear Hour Ticks (No SVG Text)
    let marker12El;
    for (let h = 1; h <= 12; h++) {
      const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
      const phi = alpha - Math.PI / 4;
      const isCardinal = (h % 3 === 0);
      const is12 = (h === 12);

      const r1 = is12 ? 23.5 : (isCardinal ? 25.5 : 28.0);
      const r2 = 32.5;
      const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, dialZ + 0.1);
      const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, dialZ + 0.1);

      const tLine = HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        class: is12 ? "hi" : (isCardinal ? "sil" : "lo")
      }, svg);
      if (is12) marker12El = tLine;
    }

    // Sweep arc showing angle between 12 and active hand
    const sweepArc = HL.mk("path", { class: "nf hi dash", d: "" }, svg);

    // 3. Hands: Short & Broad Hour Hand, Long & Slender Minute Hand
    const hourPoly = HL.mk("polygon", { class: "sil" }, svg);
    const minutePoly = HL.mk("polygon", { class: "hi" }, svg);

    const centerPin = HL.flatDot(svg, C, 2.2, "dot");
    HL.place(centerPin, P(0, 0, dialZ + 1.0));

    const startHour = initialV != null ? HL.clamp(initialV, 0, 12) : 3;
    const minuteAngleSp = HL.spring((startHour % 1) * Math.PI * 2, { k: 140, c: 14 });
    let totalMinutes = startHour * 60;
    let active = false;
    let lastKey = "";

    function draw() {
      const mRad = minuteAngleSp.x;
      const key = `${HL.r2(mRad)}:${Math.round(totalMinutes)}:${active ? 1 : 0}`;
      if (key === lastKey) return;
      lastKey = key;

      const hRad = ((totalMinutes % 720) / 720) * Math.PI * 2;
      const mPhi = mRad - Math.PI / 2 - Math.PI / 4;
      const hPhi = hRad - Math.PI / 2 - Math.PI / 4;

      const zH = dialZ + 0.4;
      const zM = dialZ + 0.8;

      const mCos = Math.cos(mPhi), mSin = Math.sin(mPhi);
      const mPerpX = -mSin, mPerpY = mCos;
      const mPts = [
        P(mCos * 25.0, mSin * 25.0, zM),
        P(mCos * 2.5 + mPerpX * 1.6, mSin * 2.5 + mPerpY * 1.6, zM),
        P(-mCos * 4.5, -mSin * 4.5, zM),
        P(mCos * 2.5 - mPerpX * 1.6, mSin * 2.5 - mPerpY * 1.6, zM)
      ];
      minutePoly.setAttribute("points", mPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const hCos = Math.cos(hPhi), hSin = Math.sin(hPhi);
      const hPerpX = -hSin, hPerpY = hCos;
      const hPts = [
        P(hCos * 16.0, hSin * 16.0, zH),
        P(hCos * 2.5 + hPerpX * 2.4, hSin * 2.5 + hPerpY * 2.4, zH),
        P(-hCos * 3.5, -hSin * 3.5, zH),
        P(hCos * 2.5 - hPerpX * 2.4, hSin * 2.5 - hPerpY * 2.4, zH)
      ];
      hourPoly.setAttribute("points", hPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const arcPts = [];
      const endA = hRad > 0.05 ? hRad : Math.PI / 2;
      for (let k = 0; k <= 16; k++) {
        const a = -Math.PI / 2 - Math.PI / 4 + (k / 16) * endA;
        arcPts.push(P(Math.cos(a) * 12.0, Math.sin(a) * 12.0, dialZ + 0.2));
      }
      sweepArc.setAttribute("d", HL.open(arcPts));

      if (marker12El) marker12El.classList.toggle("hi", !active);

      const hrs = Math.floor((totalMinutes % 720) / 60) || 12;
      const mins = Math.floor((totalMinutes % 60 + 60) % 60);
      const minStr = mins < 10 ? "0" + mins : String(mins);
      read.textContent = `Đồng hồ: ${hrs}:${minStr} (tỷ lệ 12:1)`;
    }

    let lastAimAngle = null;

    function aim(pt) {
      if (!pt) {
        active = false;
        lastAimAngle = null;
        reg.wake();
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], dialZ);
      const dist = Math.hypot(wx, wy);
      if (dist < 4 || dist > 42) return;

      active = true;
      let angle = Math.atan2(wy, wx) + Math.PI / 4 + Math.PI / 2;
      while (angle < 0) angle += Math.PI * 2;
      while (angle >= Math.PI * 2) angle -= Math.PI * 2;

      if (lastAimAngle != null) {
        let diff = angle - lastAimAngle;
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        totalMinutes = (totalMinutes + (diff / (Math.PI * 2)) * 60 + 720) % 720;
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
        minuteAngleSp.t = ((totalMinutes % 60) / 60) * Math.PI * 2;
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
