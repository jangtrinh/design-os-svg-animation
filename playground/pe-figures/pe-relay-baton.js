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

export default {
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
};
