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

export default {
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
};
