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

export default {
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
};
