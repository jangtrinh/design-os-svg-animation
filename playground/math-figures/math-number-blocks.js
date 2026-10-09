export default {
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Phép cộng & bảo toàn số lượng khi ghép khối",
  means: "Tháp khối lập phương Unifix: hai tháp 3 khối và 2 khối. Click để bốc khối từ tháp này cắm sang tháp kia; chốt tròn cắm khít lỗ âm với đàn hồi snap-back, chứng minh 3 + 2 = 5.",
  rules: [1, 2, 3, 7, 9],
  range: [0, 2, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -18, 0], [50, 18, 76]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Base Board (z = 0 to 3)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 3, 1.5);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3));

    // Base mounting studs on board at x = -20 and x = 20
    const [studAO, studAI] = HL.rings(-23.5, -3.5, -16.5, 3.5, 3.5, 0.6);
    const [studBO, studBI] = HL.rings( 16.5, -3.5,  23.5, 3.5, 3.5, 0.6);
    const baseStudASol = HL.solid(svg);
    const baseStudBSol = HL.solid(svg);
    HL.put(baseStudASol, HL.prism(P, front, studAO, studAI, 3, 5.5));
    HL.put(baseStudBSol, HL.prism(P, front, studBO, studBI, 3, 5.5));

    const blockH = 12; // Height of each unit block
    const TOTAL_BLOCKS = 5;

    // State: count on Tower A (starts at 3, Tower B has 5 - countA = 2)
    let countA = initialV != null ? HL.clamp(Math.round(initialV), 0, TOTAL_BLOCKS) : 3;

    // 5 physical blocks total.
    // Blocks 0, 1, 2 belong initially to Tower A.
    // Blocks 3, 4 belong initially to Tower B.
    // Each block has spring (x, y, z) position
    const blocks = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
      const isInitialA = i < 3;
      const targetTower = isInitialA ? -20 : 20;
      const targetStackIdx = isInitialA ? i : (i - 3);
      const targetZ = 3 + targetStackIdx * blockH;

      const blockSol = HL.solid(svg);
      const studSol = HL.solid(svg);

      // Dash socket rim when airborne
      const socketRimEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);

      blocks.push({
        idx: i,
        // Springs for smooth flight in X and Z
        spX: HL.spring(targetTower, { k: 180, c: 16 }),
        spZ: HL.spring(targetZ, { k: 220, c: 17 }),
        blockSol,
        studSol,
        socketRimEl
      });
    }

    function syncTargets() {
      // Tower A gets blocks 0 .. countA - 1
      for (let i = 0; i < countA; i++) {
        const b = blocks[i];
        b.spX.t = -20;
        b.spZ.t = 3 + i * blockH;
      }
      // Tower B gets blocks countA .. TOTAL_BLOCKS - 1
      let stackB = 0;
      for (let i = countA; i < TOTAL_BLOCKS; i++) {
        const b = blocks[i];
        b.spX.t = 20;
        b.spZ.t = 3 + stackB * blockH;
        stackB++;
      }
      reg.wake();
    }

    function draw() {
      blocks.forEach(b => {
        const curX = b.spX.x;
        const curZ = b.spZ.x;

        // Block cube prism (17 x 17 footprint, height 12)
        const [bO, bI] = HL.rings(curX - 8.5, -8.5, curX + 8.5, 8.5, 2, 1);
        HL.put(b.blockSol, HL.prism(P, front, bO, bI, curZ, curZ + blockH));

        // Interlocking stud on top face
        const [sO, sI] = HL.rings(curX - 3.5, -3.5, curX + 3.5, 3.5, 3.5, 0.6);
        HL.put(b.studSol, HL.prism(P, front, sO, sI, curZ + blockH, curZ + blockH + 2.5));

        // Socket dashed rim at bottom if airborne
        const isAirborne = Math.abs(curX - (-20)) > 2 && Math.abs(curX - 20) > 2;
        if (isAirborne) {
          const rimPts = [];
          for (let k = 0; k <= 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            rimPts.push(P(curX + 3.6 * Math.cos(a), 3.6 * Math.sin(a), curZ));
          }
          b.socketRimEl.style.display = "";
          b.socketRimEl.setAttribute("d", HL.poly(rimPts));
        } else {
          b.socketRimEl.style.display = "none";
        }
      });

      const countB = TOTAL_BLOCKS - countA;
      if (countA === 5) {
        read.textContent = `Đã ghép trọn vẹn: Tháp A có 5 khối (3 + 2 = 5) · Tháp B trống!`;
      } else if (countA === 0) {
        read.textContent = `Chuyển hết sang tháp B: 0 + 5 = 5 khối · Tháp A trống!`;
      } else {
        read.textContent = `Phép cộng ghép khối: ${countA} khối (Tháp A) + ${countB} khối (Tháp B) = 5 khối (Bảo toàn tổng số)`;
      }
    }

    function toggleTransfer(pt) {
      if (!pt) {
        // Step cycle countA: 3 -> 4 -> 5 -> 2 -> 3
        countA = countA >= TOTAL_BLOCKS ? 1 : countA + 1;
        syncTargets();
        return;
      }

      // Check if clicked left or right half
      const midScr = P(0, 0, 10)[0];
      if (pt[0] > midScr) {
        // Clicked right side (Tower B): transfer block from B to A
        if (countA < TOTAL_BLOCKS) {
          countA++;
        } else {
          countA = 2; // Reset to split
        }
      } else {
        // Clicked left side (Tower A): transfer block from A to B
        if (countA > 0) {
          countA--;
        } else {
          countA = 3; // Reset
        }
      }
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
    bag.add(HL.pointer(stage, { down: toggleTransfer }));
    bag.add(() => svg.replaceChildren());

    // Initial positioning
    syncTargets();
    draw();

    return {
      set(v) {
        countA = HL.clamp(Math.round(v), 0, TOTAL_BLOCKS);
        syncTargets();
      },
      destroy: bag.dispose
    };
  }
};
