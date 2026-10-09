/*
 * 7. Teaching Clock (Mặt Đồng Hồ Học Giờ)
 * Authentic Grade 1 Pedagogical Manipulative: Telling Time & 12:1 Gear Ratio
 * Lucas Markes Hairline Standard:
 * - Stepped horological easel desk clock with turned brass bezel & support plinth
 * - Pure horological dial with zero SVG text: double-baton cardinal indices (12, 3, 6, 9) & 60 minute ticks
 * - Precision sculpted sword hands with diamond/circular counterweight hubs
 * - Center jewel axle cap with concentric turning rings
 * - Mechanically coupled 12:1 gear ratio kinematics
 * - Single focal highlight (hi) on 12 o'clock index at rest, transferring to minute hand
 * - Pure 2:1 axonometric line art, zero SVG text
 */

export default {
  id: "math-clock",
  title: "7. Mặt Đồng Hồ Học Giờ (Teaching Clock)",
  concept: "Xem giờ đúng & tỷ lệ bánh răng 12:1",
  means: "Đồng hồ để bàn chính xác: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1, hiển thị chỉ số cọc giờ thanh lịch.",
  rules: [1, 2, 4, 6, 9],
  range: [0, 3, 12],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-48, -48, 0], [48, 48, 22]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Grounding Plinth & Twin Turned Brass Feet (Z: 0 to 4)
    // Plinth base
    const [baseO, baseI] = HL.rings(-38, -20, 38, 20, 4.0, 1.2);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 4));

    // Two turned brass leveling feet at front
    for (const bx of [-28, 28]) {
      const [fO] = HL.rings(bx - 3.5, 12 - 3.5, bx + 3.5, 12 + 3.5, 3.5, 0.6);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
      HL.mk("circle", { cx: HL.r2(P(bx, 12, 4.2)[0]), cy: HL.r2(P(bx, 12, 4.2)[1]), r: 1.2, fill: "#232327" }, svg);
    }

    // Easel back-support strut
    HL.mk("line", {
      x1: HL.r2(P(0, -16, 4)[0]), y1: HL.r2(P(0, -16, 4)[1]),
      x2: HL.r2(P(0, -28, 0)[0]), y2: HL.r2(P(0, -28, 0)[1]),
      class: "lo", "stroke-width": 1.4
    }, svg);

    // 2. Turned Clock Bezel Casing (Z: 4 to 10)
    const [bezelO, bezelI] = HL.rings(-36, -36, 36, 36, 36, 2.5);
    const bezelSol = HL.solid(svg);
    HL.put(bezelSol, HL.prism(P, front, bezelO, bezelI, 4, 10));

    // Inset Dial Face Floor Rim at Z = 9.8
    const dialRim = HL.mk("ellipse", {
      rx: HL.r2(33.5 * C.S), ry: HL.r2(33.5 * C.S * C.k),
      class: "lo nf"
    }, svg);
    const centerScr = P(0, 0, 9.8);
    dialRim.setAttribute("cx", HL.r2(centerScr[0]));
    dialRim.setAttribute("cy", HL.r2(centerScr[1]));

    // 3. Dial Graduation: Zero Text! Pure Calibrated Indices
    // 60 fine minute ticks around perimeter (radius 30.5 to 32.5)
    for (let m = 0; m < 60; m++) {
      if (m % 5 === 0) continue; // Major hour ticks drawn separately
      const alpha = -Math.PI / 2 + (m / 60) * Math.PI * 2;
      const phi = alpha - Math.PI / 4;
      const r1 = 30.8, r2 = 32.5;
      const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 10.0);
      const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 10.0);
      HL.mk("line", {
        x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
        x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
        class: "lo", "stroke-width": 0.6
      }, svg);
    }

    // 12 Major Hour Indices
    let marker12El;
    for (let h = 1; h <= 12; h++) {
      const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
      const phi = alpha - Math.PI / 4;
      const isCardinal = (h % 3 === 0);
      const is12 = (h === 12);

      if (is12) {
        // Double baton at 12 o'clock with focal highlight (hi)
        const dPhi = 0.04;
        const p1A = P(Math.cos(phi - dPhi) * 25.5, Math.sin(phi - dPhi) * 25.5, 10.0);
        const p2A = P(Math.cos(phi - dPhi) * 32.5, Math.sin(phi - dPhi) * 32.5, 10.0);
        const p1B = P(Math.cos(phi + dPhi) * 25.5, Math.sin(phi + dPhi) * 25.5, 10.0);
        const p2B = P(Math.cos(phi + dPhi) * 32.5, Math.sin(phi + dPhi) * 32.5, 10.0);
        marker12El = HL.mk("line", {
          x1: HL.r2(p1A[0]), y1: HL.r2(p1A[1]), x2: HL.r2(p2A[0]), y2: HL.r2(p2A[1]),
          class: "hi", "stroke-width": 1.5
        }, svg);
        HL.mk("line", {
          x1: HL.r2(p1B[0]), y1: HL.r2(p1B[1]), x2: HL.r2(p2B[0]), y2: HL.r2(p2B[1]),
          class: "hi", "stroke-width": 1.5
        }, svg);
      } else if (isCardinal) {
        // Double baton at 3, 6, 9
        const dPhi = 0.035;
        const p1A = P(Math.cos(phi - dPhi) * 26.5, Math.sin(phi - dPhi) * 26.5, 10.0);
        const p2A = P(Math.cos(phi - dPhi) * 32.5, Math.sin(phi - dPhi) * 32.5, 10.0);
        const p1B = P(Math.cos(phi + dPhi) * 26.5, Math.sin(phi + dPhi) * 26.5, 10.0);
        const p2B = P(Math.cos(phi + dPhi) * 32.5, Math.sin(phi + dPhi) * 32.5, 10.0);
        HL.mk("line", {
          x1: HL.r2(p1A[0]), y1: HL.r2(p1A[1]), x2: HL.r2(p2A[0]), y2: HL.r2(p2A[1]),
          stroke: "#232327", "stroke-width": 1.3
        }, svg);
        HL.mk("line", {
          x1: HL.r2(p1B[0]), y1: HL.r2(p1B[1]), x2: HL.r2(p2B[0]), y2: HL.r2(p2B[1]),
          stroke: "#232327", "stroke-width": 1.3
        }, svg);
      } else {
        // Single precision baton at other hours
        const p1 = P(Math.cos(phi) * 27.5, Math.sin(phi) * 27.5, 10.0);
        const p2 = P(Math.cos(phi) * 32.5, Math.sin(phi) * 32.5, 10.0);
        HL.mk("line", {
          x1: HL.r2(p1[0]), y1: HL.r2(p1[1]), x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
          stroke: "#232327", "stroke-width": 1.2
        }, svg);
      }

      // Hour pip dot on inner perimeter
      const pipP = P(Math.cos(phi) * 22.5, Math.sin(phi) * 22.5, 10.0);
      HL.mk("circle", {
        cx: HL.r2(pipP[0]), cy: HL.r2(pipP[1]),
        r: isCardinal ? 1.4 : 1.0,
        fill: "#232327"
      }, svg);
    }

    // 4. Precision Sculpted Clock Hands
    // Hour Hand (short & broad dauphine sword hand with diamond counterweight)
    const hourPoly = HL.mk("polygon", {
      style: "fill: #232327; stroke: #111113; stroke-width: 1.0; stroke-linejoin: round;"
    }, svg);

    // Minute Hand (long & slender sword hand with circular counterweight)
    const minutePoly = HL.mk("polygon", {
      style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;"
    }, svg);

    // Center Jewel Axle Cap (covers hand roots)
    const centerPinOuter = HL.mk("ellipse", {
      rx: HL.r2(3.2 * C.S), ry: HL.r2(3.2 * C.S * C.k),
      style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2;"
    }, svg);
    const centerPinInner = HL.mk("ellipse", {
      rx: HL.r2(1.4 * C.S), ry: HL.r2(1.4 * C.S * C.k),
      style: "fill: #232327; stroke: none;"
    }, svg);
    centerPinOuter.setAttribute("cx", HL.r2(centerScr[0]));
    centerPinOuter.setAttribute("cy", HL.r2(centerScr[1]));
    centerPinInner.setAttribute("cx", HL.r2(centerScr[0]));
    centerPinInner.setAttribute("cy", HL.r2(centerScr[1]));

    // Clock State: initial at 3:00
    const startHour = initialV != null ? HL.clamp(initialV, 0, 12) : 3;
    const minuteAngleSp = HL.spring((startHour % 1) * Math.PI * 2, { k: 140, c: 14 });
    let totalMinutes = startHour * 60;
    let active = false;

    function draw() {
      const mRad = minuteAngleSp.x;
      const hRad = (totalMinutes / 720) * Math.PI * 2;

      // Coordinate transformation on dial face
      const mPhi = mRad - Math.PI / 2 - Math.PI / 4;
      const hPhi = hRad - Math.PI / 2 - Math.PI / 4;

      const zH = 10.4;
      const zM = 10.8;

      // Sculpted Minute Hand: length 25.5, width 2.2, tail -6.0 with counterweight
      const mCos = Math.cos(mPhi), mSin = Math.sin(mPhi);
      const mPerpX = -mSin, mPerpY = mCos;

      const mPts = [
        P(mCos * 25.5, mSin * 25.5, zM),                     // Tip
        P(mCos * 21.0 + mPerpX * 1.8, mSin * 21.0 + mPerpY * 1.8, zM), // Shoulder R
        P(mCos * 3.0 + mPerpX * 1.6, mSin * 3.0 + mPerpY * 1.6, zM),   // Body R
        P(-mCos * 5.5 + mPerpX * 2.4, -mSin * 5.5 + mPerpY * 2.4, zM), // Counterweight ring R
        P(-mCos * 7.5, -mSin * 7.5, zM),                     // Tail tip
        P(-mCos * 5.5 - mPerpX * 2.4, -mSin * 5.5 - mPerpY * 2.4, zM), // Counterweight ring L
        P(mCos * 3.0 - mPerpX * 1.6, mSin * 3.0 - mPerpY * 1.6, zM),   // Body L
        P(mCos * 21.0 - mPerpX * 1.8, mSin * 21.0 - mPerpY * 1.8, zM)  // Shoulder L
      ];
      minutePoly.setAttribute("points", mPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Sculpted Hour Hand: length 16.5, width 3.2, tail -4.5 with diamond counterweight
      const hCos = Math.cos(hPhi), hSin = Math.sin(hPhi);
      const hPerpX = -hSin, hPerpY = hCos;

      const hPts = [
        P(hCos * 16.5, hSin * 16.5, zH),                     // Tip
        P(hCos * 12.5 + hPerpX * 2.6, hSin * 12.5 + hPerpY * 2.6, zH), // Shoulder R
        P(hCos * 2.5 + hPerpX * 2.2, hSin * 2.5 + hPerpY * 2.2, zH),   // Body R
        P(-hCos * 3.5 + hPerpX * 2.2, -hSin * 3.5 + hPerpY * 2.2, zH), // Diamond hub R
        P(-hCos * 5.5, -hSin * 5.5, zH),                     // Tail tip
        P(-hCos * 3.5 - hPerpX * 2.2, -hSin * 3.5 - hPerpY * 2.2, zH), // Diamond hub L
        P(hCos * 2.5 - hPerpX * 2.2, hSin * 2.5 - hPerpY * 2.2, zH),   // Body L
        P(hCos * 12.5 - hPerpX * 2.6, hSin * 12.5 - hPerpY * 2.6, zH)  // Shoulder L
      ];
      hourPoly.setAttribute("points", hPts.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      // Semantic highlight transfer
      if (marker12El) marker12El.classList.toggle("hi", !active);
      minutePoly.classList.toggle("hi", active);

      // DOM Text readout
      const hrs = Math.floor((totalMinutes % 720) / 60) || 12;
      const mins = Math.floor(totalMinutes % 60);
      const minStr = mins < 10 ? "0" + mins : mins;
      read.textContent = "Clock: " + hrs + ":" + minStr + " (12:1 gear ratio)";
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

      if (dist < 12 || dist > 110) return;

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
