export default {
    id: "math-clock",
    title: "7. Mặt Đồng Hồ Học Giờ (Teaching Clock)",
    concept: "Xem giờ đúng & tỷ lệ 12:1",
    means: "Đồng hồ kim: di chuột theo vòng tròn để quay kim phút; kim giờ chuyển động chính xác theo tỷ lệ bánh răng 12:1.",
    rules: [1, 2, 4, 6, 8],
    range: [0, 3, 12],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-46, -46, 0], [46, 46, 18]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Bezel Prism
      const [dialO, dialI] = HL.rings(-42, -42, 42, 42, 42, 3);
      const bezelSol = HL.solid(svg);
      HL.put(bezelSol, HL.prism(P, front, dialO, dialI, 0, 6));

      // Dial Face Inner Crease
      const dialInner = HL.mk("ellipse", { rx: HL.r2(39 * C.S), ry: HL.r2(39 * C.S * C.k), class: "lo nf" }, svg);
      const centerScr = P(0, 0, 6.2);
      dialInner.setAttribute("cx", HL.r2(centerScr[0]));
      dialInner.setAttribute("cy", HL.r2(centerScr[1]));

      // 60 Minute Ticks around rim (r = 35.5 to 38.0)
      for (let m = 0; m < 60; m++) {
        if (m % 5 === 0) continue; // Hour ticks drawn separately
        const alpha = -Math.PI / 2 + (m / 60) * Math.PI * 2;
        const phi = alpha - Math.PI / 4;
        const r1 = 36.0, r2 = 38.0;
        const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 6.2);
        const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 6.2);
        HL.mk("line", {
          x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
          x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
          class: "lo"
        }, svg);
      }

      // 12 Major Hour Ticks (r = 32.5 to 38.0)
      for (let h = 1; h <= 12; h++) {
        const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
        const phi = alpha - Math.PI / 4;
        const r1 = h % 3 === 0 ? 32.0 : 33.5;
        const r2 = 38.0;
        const p1 = P(Math.cos(phi) * r1, Math.sin(phi) * r1, 6.2);
        const p2 = P(Math.cos(phi) * r2, Math.sin(phi) * r2, 6.2);
        HL.mk("line", {
          x1: HL.r2(p1[0]), y1: HL.r2(p1[1]),
          x2: HL.r2(p2[0]), y2: HL.r2(p2[1]),
          stroke: "#232327",
          "stroke-width": h % 3 === 0 ? 1.6 : 1.1
        }, svg);
      }

      // Hour Hand (Short & broad, solid dark with sharp arrowhead pointing inside number ring)
      const hourPoly = HL.mk("polygon", {
        style: "fill: #232327; stroke: #111113; stroke-width: 0.8; stroke-linejoin: round;"
      }, svg);

      // Minute Hand (Long & slender, white plate with dark stroke & sharp arrowhead pointing at ticks)
      const minutePoly = HL.mk("polygon", {
        style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;"
      }, svg);

      // 12 Clock Face Numbers (1 to 12) placed on 2:1 axonometric circle at radius 22
      // Sits in clear channel between hour tip (15.5) and minute arrow base (26.5)
      for (let h = 1; h <= 12; h++) {
        const alpha = -Math.PI / 2 + (h / 12) * Math.PI * 2;
        const phi = alpha - Math.PI / 4;
        const rNum = 22.0;
        const nx = Math.cos(phi) * rNum;
        const ny = Math.sin(phi) * rNum;
        const pt = P(nx, ny, 6.4);

        const txt = HL.mk("text", {
          x: HL.r2(pt[0]),
          y: HL.r2(pt[1] + 2.8), // optical vertical alignment
          "text-anchor": "middle",
          style: `fill: #232327; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: ${h % 3 === 0 ? "9.5px" : "8px"}; font-weight: ${h % 3 === 0 ? "700" : "600"}; pointer-events: none;`
        }, svg);
        txt.textContent = String(h);
      }

      // Center Pin Housing & Axle Cap (covers hand roots)
      const centerPinOuter = HL.mk("ellipse", {
        rx: HL.r2(3.0 * C.S), ry: HL.r2(3.0 * C.S * C.k),
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

      // Clock State: default at 3:00
      const startHour = 3;
      const initialTurn = (initialV !== undefined ? (initialV - startHour) : 0) * Math.PI * 2;
      const rotSpring = HL.spring(initialTurn, { k: 120, c: 14 });

      // Generate hand polygon vertices projected on dial plane
      // handAngle: angle clockwise from 12 in dial coordinates
      // spec: { len, arrowBase, arrowW, bodyW, tailLen }
      function makeHandPolygon(handAngle, spec, zHeight) {
        const phi = (-Math.PI / 2 + handAngle) - Math.PI / 4;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        // Unit vector along hand (u) and perpendicular across (v)
        const ux = cosP, uy = sinP;
        const vx = -sinP, vy = cosP;

        function vertex(L, W) {
          const wx = L * ux + W * vx;
          const wy = L * uy + W * vy;
          return P(wx, wy, zHeight);
        }

        const pts = [
          vertex(-spec.tailLen, -spec.bodyW),
          vertex(-spec.tailLen,  spec.bodyW),
          vertex(spec.arrowBase, spec.bodyW),
          vertex(spec.arrowBase, spec.arrowW),
          vertex(spec.len,       0),
          vertex(spec.arrowBase, -spec.arrowW),
          vertex(spec.arrowBase, -spec.bodyW)
        ];

        return pts.map(p => p.map(HL.r2).join(",")).join(" ");
      }

      function draw() {
        const minRot = rotSpring.x;
        // Gear ratio: 12:1 exact clockwise coupling
        const hourRot = minRot / 12 + (startHour / 12) * Math.PI * 2;

        // Hour Hand: shorter (len=15.5, tip reaches inside number ring), wider (bodyW=1.8, arrowW=2.8)
        const hourSpec = { len: 15.5, arrowBase: 11.0, arrowW: 2.8, bodyW: 1.8, tailLen: 3.5 };
        hourPoly.setAttribute("points", makeHandPolygon(hourRot, hourSpec, 7.0));

        // Minute Hand: longer (len=32.5, arrowBase=26.5 outside numbers, tip reaches ticks at 33..38)
        const minSpec = { len: 32.5, arrowBase: 26.5, arrowW: 1.8, bodyW: 0.9, tailLen: 4.0 };
        minutePoly.setAttribute("points", makeHandPolygon(minRot, minSpec, 7.5));

        // Time Calculation
        const totalMinutes = (startHour * 60) + (minRot / (Math.PI * 2)) * 60;
        let posMinutes = Math.round(totalMinutes);
        while (posMinutes < 0) posMinutes += 12 * 60;
        const mins = posMinutes % 60;
        const hrs = ((Math.floor(posMinutes / 60) - 1) % 12 + 12) % 12 + 1;
        const minStr = mins < 10 ? "0" + mins : String(mins);
        read.textContent = `Đồng hồ: ${hrs}:${minStr} (Tỷ lệ bánh răng 12:1)`;
      }

      let lastClockAngle = null;
      let targetRot = initialTurn;

      function aim(pt) {
        if (!pt) {
          lastClockAngle = null;
          return;
        }

        // Project pointer relative to dial center, uncompressing 2:1 axonometric Y
        const dx = pt[0] - centerScr[0];
        const dy = (pt[1] - centerScr[1]) * 2;
        const curPointerAngle = Math.atan2(dy, dx);

        // Angle clockwise from 12 o'clock (-Math.PI / 2)
        let clockAngle = curPointerAngle - (-Math.PI / 2);
        while (clockAngle < 0) clockAngle += Math.PI * 2;
        while (clockAngle >= Math.PI * 2) clockAngle -= Math.PI * 2;

        if (lastClockAngle !== null) {
          let diff = clockAngle - lastClockAngle;
          if (diff < -Math.PI) diff += Math.PI * 2;
          else if (diff > Math.PI) diff -= Math.PI * 2;
          targetRot += diff;
        } else {
          // Snap targetRot to nearest equivalent of clockAngle
          const turns = Math.round((targetRot - clockAngle) / (Math.PI * 2));
          targetRot = turns * Math.PI * 2 + clockAngle;
        }

        lastClockAngle = clockAngle;
        rotSpring.t = targetRot;
        reg.wake();
      }

      function handleClick(pt) {
        // Advance clock by 1 full hour (2*PI on minute hand)
        targetRot += Math.PI * 2;
        rotSpring.t = targetRot;
        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const moving = HL.stepS(rotSpring, dt);
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, down: handleClick, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          targetRot = (v - startHour) * Math.PI * 2;
          lastClockAngle = null;
          rotSpring.t = targetRot;
          reg.wake();
        },
        destroy: bag.dispose
      };
    }
  };
