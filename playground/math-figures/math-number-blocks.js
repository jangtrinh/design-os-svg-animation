/*
 * 4. Number Blocks Tower (Tháp Khối Số Học Unifix)
 * Authentic Grade 1 Pedagogical Manipulative: Part-Whole Addition & Conservation (3 + 2 = 5)
 * Lucas Markes Hairline Standard:
 * - Turned baseboard with beveled edges (r=3.5, b=1.2) & twin mounting plinths
 * - Precision interlocking Unifix unit cubes with recessed face panels & stack seams
 * - Hollow cylindrical interlocking studs with center core bore holes (r_out=3.6, r_in=1.8)
 * - Airborne flight along parabolic transfer arcs with spring kinematics
 * - Semantic focal highlight (hi) on active transferring block
 * - Pure 2:1 axonometric line art, zero SVG text
 */

export default {
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Phép cộng & bảo toàn số lượng khi ghép khối (3 + 2 = 5)",
  means: "Tháp khối lập phương Unifix: hai tháp 3 khối và 2 khối; di chuột để chuyển khối theo cung bay parabol mượt mà, trực quan hóa bảo toàn số lượng.",
  rules: [1, 2, 3, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-54, -20, 0], [54, 20, 80]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Turned Hardwood Baseboard (Z: 0 to 4)
    const [baseO, baseI] = HL.rings(-50, -18, 50, 18, 3.5, 1.2);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 4));

    // Corner foot pads
    for (const [fx, fy] of [[-44, -14], [44, -14], [-44, 14], [44, 14]]) {
      const [fO] = HL.rings(fx - 2.8, fy - 2.8, fx + 2.8, fy + 2.8, 2.8, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // Base mounting boss studs on board at x = -20 and x = 20
    for (const bx of [-20, 20]) {
      const [studO, studI] = HL.rings(bx - 4.0, -4.0, bx + 4.0, 4.0, 4.0, 0.7);
      const studSol = HL.solid(svg);
      HL.put(studSol, HL.prism(P, front, studO, studI, 4, 6.8));
      // Hollow center bore
      const centerScr = P(bx, 0, 6.9);
      HL.mk("ellipse", {
        cx: HL.r2(centerScr[0]), cy: HL.r2(centerScr[1]),
        rx: HL.r2(1.8 * C.S), ry: HL.r2(1.8 * C.S * C.k),
        fill: "#232327", stroke: "none"
      }, svg);
    }

    const blockH = 12.5; // Height of each unit cube
    const TOTAL_BLOCKS = 5;

    // State: count on Tower A (starts at 3, Tower B has 5 - 3 = 2)
    let countA = initialV != null ? HL.clamp(Math.round(initialV), 1, 5) : 3;

    // 5 physical Unifix unit blocks
    const blocks = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
      const isInitialA = i < 3;
      const targetTower = isInitialA ? -20 : 20;
      const targetStackIdx = isInitialA ? i : (i - 3);
      const targetZ = 4 + targetStackIdx * blockH;

      const blockSol = HL.solid(svg);
      const studSol = HL.solid(svg);
      const studBore = HL.mk("ellipse", {
        rx: HL.r2(1.8 * C.S), ry: HL.r2(1.8 * C.S * C.k),
        fill: "#232327", stroke: "none"
      }, svg);

      // Inset face frame creases for side faces
      const faceCrease1 = HL.mk("path", { class: "cr nf", d: "" }, svg);
      const faceCrease2 = HL.mk("path", { class: "cr nf", d: "" }, svg);

      // Dash socket rim when airborne
      const socketRimEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

      blocks.push({
        idx: i,
        spX: HL.spring(targetTower, { k: 160, c: 15 }),
        spZ: HL.spring(targetZ, { k: 180, c: 16 }),
        blockSol,
        studSol,
        studBore,
        faceCrease1,
        faceCrease2,
        socketRimEl
      });
    }

    function syncTargets() {
      // Tower A gets blocks 0 .. countA - 1
      for (let i = 0; i < countA; i++) {
        const b = blocks[i];
        b.spX.t = -20;
        b.spZ.t = 4 + i * blockH;
      }
      // Tower B gets blocks countA .. TOTAL_BLOCKS - 1
      let stackB = 0;
      for (let i = countA; i < TOTAL_BLOCKS; i++) {
        const b = blocks[i];
        b.spX.t = 20;
        b.spZ.t = 4 + stackB * blockH;
        stackB++;
      }
      reg.wake();
    }

    function draw() {
      blocks.forEach(b => {
        const curX = b.spX.x;
        const curZ = b.spZ.x;

        // Block cube prism (17 x 17 footprint, height 12.5) with corner fillet r=2.2, bevel b=0.9
        const [bO, bI] = HL.rings(curX - 8.5, -8.5, curX + 8.5, 8.5, 2.2, 0.9);
        HL.put(b.blockSol, HL.prism(P, front, bO, bI, curZ, curZ + blockH));

        // Hollow interlocking stud on top face
        const [sO, sI] = HL.rings(curX - 3.8, -3.8, curX + 3.8, 3.8, 3.8, 0.6);
        HL.put(b.studSol, HL.prism(P, front, sO, sI, curZ + blockH, curZ + blockH + 2.8));

        // Stud center core bore hole
        const studTopScr = P(curX, 0, curZ + blockH + 2.9);
        b.studBore.setAttribute("cx", HL.r2(studTopScr[0]));
        b.studBore.setAttribute("cy", HL.r2(studTopScr[1]));

        // Inset square face panels on visible front/side faces
        const fZ0 = curZ + 1.8;
        const fZ1 = curZ + blockH - 1.8;
        // Face 1 (front-right: Y = 8.5)
        const fc1 = [
          P(curX - 6.5, 8.5, fZ0), P(curX + 6.5, 8.5, fZ0),
          P(curX + 6.5, 8.5, fZ1), P(curX - 6.5, 8.5, fZ1)
        ];
        b.faceCrease1.setAttribute("d", HL.poly(fc1));

        // Face 2 (front-left: X = curX + 8.5)
        const fc2 = [
          P(curX + 8.5, -6.5, fZ0), P(curX + 8.5, 6.5, fZ0),
          P(curX + 8.5, 6.5, fZ1), P(curX + 8.5, -6.5, fZ1)
        ];
        b.faceCrease2.setAttribute("d", HL.poly(fc2));

        // Airborne state: socket dashed rim & focal highlight
        const isAirborne = Math.abs(curX - (-20)) > 2 && Math.abs(curX - 20) > 2;
        b.blockSol.sil.classList.toggle("hi", isAirborne);
        b.studSol.sil.classList.toggle("hi", isAirborne);

        if (isAirborne) {
          const rimPts = [];
          for (let k = 0; k <= 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            rimPts.push(P(curX + 3.8 * Math.cos(a), 3.8 * Math.sin(a), curZ));
          }
          b.socketRimEl.style.display = "";
          b.socketRimEl.setAttribute("d", HL.poly(rimPts));
        } else {
          b.socketRimEl.style.display = "none";
        }
      });

      const countB = TOTAL_BLOCKS - countA;
      read.textContent = "Unifix: " + countA + " + " + countB + " = 5";
    }

    function aim(pt) {
      if (!pt) {
        countA = 3;
        syncTargets();
        return;
      }
      const pLeft = P(-20, 0, 10)[0];
      const pRight = P(20, 0, 10)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      countA = HL.clamp(Math.round(1 + norm * 4), 1, 5);
      syncTargets();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      blocks.forEach(b => {
        const mx = HL.stepS(b.spX, dt);
        const mz = HL.stepS(b.spZ, dt);
        if (mx || mz) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => {
        countA = 3;
        syncTargets();
      }
    }));
    bag.add(() => svg.replaceChildren());

    syncTargets();
    draw();

    return {
      set(v) {
        countA = HL.clamp(Math.round(v), 1, TOTAL_BLOCKS);
        syncTargets();
      },
      destroy: bag.dispose
    };
  }
};
