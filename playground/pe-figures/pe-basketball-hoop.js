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

export default {
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
};
