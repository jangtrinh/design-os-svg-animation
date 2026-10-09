/*
 * 4. Number Blocks Tower (Tháp Khối Số Học Unifix)
 * Pedagogical Goal: Part-whole addition & conservation of volume (3 + 2 = 5)
 * Simplified Geometry: Clean interlocking cubes with cylindrical top studs on a simple baseboard
 * Meaningful Interaction: Moving pointer smoothly transfers cubes across towers along a parabolic arc
 */

export default {
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Phép cộng & bảo toàn số lượng khi ghép khối (3 + 2 = 5)",
  means: "Tháp khối lập phương Unifix tinh giản: hai tháp 3 khối và 2 khối; di chuột để chuyển khối theo cung bay parabol mượt mà, trực quan hóa bảo toàn số lượng.",
  rules: [1, 2, 3, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -18, 0], [50, 18, 76]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Hardwood Baseboard (Z: 0 to 3.5)
    const [baseO, baseI] = HL.rings(-46, -16, 46, 16, 3.0, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3.5));

    // Base mounting boss studs on board at x = -20 and x = 20
    for (const bx of [-20, 20]) {
      const [studO, studI] = HL.rings(bx - 3.5, -3.5, bx + 3.5, 3.5, 3.5, 0.5);
      const studSol = HL.solid(svg);
      HL.put(studSol, HL.prism(P, front, studO, studI, 3.5, 5.5));
    }

    const blockH = 12.0;
    const TOTAL_BLOCKS = 5;

    let countA = initialV != null ? HL.clamp(Math.round(initialV), 1, 5) : 3;

    // 5 physical Unifix unit blocks
    const blocks = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
      const isInitialA = i < 3;
      const targetTower = isInitialA ? -20 : 20;
      const targetStackIdx = isInitialA ? i : (i - 3);
      const targetZ = 3.5 + targetStackIdx * blockH;

      const blockSol = HL.solid(svg);
      const studSol = HL.solid(svg);

      blocks.push({
        idx: i,
        spX: HL.spring(targetTower, { k: 160, c: 15 }),
        spZ: HL.spring(targetZ, { k: 180, c: 16 }),
        blockSol,
        studSol
      });
    }

    function syncTargets() {
      // Tower A gets blocks 0 .. countA - 1
      for (let i = 0; i < countA; i++) {
        const b = blocks[i];
        b.spX.t = -20;
        b.spZ.t = 3.5 + i * blockH;
      }
      // Tower B gets blocks countA .. TOTAL_BLOCKS - 1
      let stackB = 0;
      for (let i = countA; i < TOTAL_BLOCKS; i++) {
        const b = blocks[i];
        b.spX.t = 20;
        b.spZ.t = 3.5 + stackB * blockH;
        stackB++;
      }
      reg.wake();
    }

    function draw() {
      blocks.forEach(b => {
        const curX = b.spX.x;
        const curZ = b.spZ.x;

        // Block cube prism (16 x 16 footprint, height 12)
        const [bO, bI] = HL.rings(curX - 8.0, -8.0, curX + 8.0, 8.0, 2.0, 0.8);
        HL.put(b.blockSol, HL.prism(P, front, bO, bI, curZ, curZ + blockH));

        // Interlocking stud on top face
        const [sO, sI] = HL.rings(curX - 3.5, -3.5, curX + 3.5, 3.5, 3.5, 0.5);
        HL.put(b.studSol, HL.prism(P, front, sO, sI, curZ + blockH, curZ + blockH + 2.4));

        // Airborne highlight
        const isAirborne = Math.abs(curX - (-20)) > 2 && Math.abs(curX - 20) > 2;
        b.blockSol.sil.classList.toggle("hi", isAirborne);
        b.studSol.sil.classList.toggle("hi", isAirborne);
      });

      const countB = TOTAL_BLOCKS - countA;
      read.textContent = "Khối ghép: " + countA + " khối + " + countB + " khối = 5 khối";
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
