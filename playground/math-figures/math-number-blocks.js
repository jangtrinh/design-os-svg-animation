export default {
  id: "math-number-blocks",
  title: "4. Tháp Khối Số Học (Unifix Number Blocks)",
  concept: "Thứ tự số tự nhiên & chiều cao",
  means: "Tháp khối lập phương Unifix: 3 tháp độ cao 1, 3 và 5. Bảo toàn thể tích; di chuột làm khối đỉnh tách rời lộ chốt tròn & lỗ cắm âm với đàn hồi snap-back.",
  rules: [1, 2, 3, 7, 9],
  range: [1, 3, 5],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -15, 0], [50, 15, 84]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Base Board (z = 0 to 3)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 3, 1.5);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 3));

    const blockH = 13; // Strict invariant: unit cube height is 13, strictly conserved

    const towers = [
      { x: -32, count: 1, lift: HL.spring(0, { k: 170, c: 15 }) },
      { x: 0, count: 3, lift: HL.spring(0, { k: 170, c: 15 }) },
      { x: 32, count: 5, lift: HL.spring(0, { k: 170, c: 15 }) }
    ];

    // Build graphics holders for each tower
    towers.forEach(t => {
      // Base stud on board (revealed when tower with count 1 lifts)
      t.baseStudSol = HL.solid(svg);

      // Solids for blocks: each block gets 1 solid for cube body, 1 solid for stud
      t.blockSols = [];
      t.studSols = [];
      for (let i = 0; i < t.count; i++) {
        t.blockSols.push(HL.solid(svg));
        t.studSols.push(HL.solid(svg));
      }

      // Detach socket visuals for top block
      // 1. Socket rim at bottom face
      t.socketRimEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
      // 2. Socket cavity ceiling inside block
      t.socketDepthEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
      // 3. Vertical alignment axis guide connecting lower stud to upper socket
      t.alignGuideEl = HL.mk("path", { class: "nf lo dash", d: "" }, svg);
    });

    function draw() {
      towers.forEach(t => {
        const liftZ = t.lift.x; // Detach elevation in Z
        const isDetached = liftZ > 0.5;

        // Base stud on board at (t.x, 0, z = 3)
        const [baseStudO, baseStudI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
        if (t.count === 1 && isDetached) {
          HL.put(t.baseStudSol, HL.prism(P, front, baseStudO, baseStudI, 3, 5.5));
        } else {
          HL.put(t.baseStudSol, { sil: "", crease: "" });
        }

        // Render lower blocks (0 to count - 2)
        for (let i = 0; i < t.count - 1; i++) {
          const z0 = 3 + i * blockH;
          const z1 = z0 + blockH;

          // Block cube body (Strictly constant height blockH = 13, no volume squash)
          const [bO, bI] = HL.rings(t.x - 9, -9, t.x + 9, 9, 2, 1);
          HL.put(t.blockSols[i], HL.prism(P, front, bO, bI, z0, z1));

          // Connecting stud on block i:
          if (i === t.count - 2) {
            // Block directly beneath the detached top block:
            // Stud is revealed when top block lifts up
            if (isDetached) {
              const [sO, sI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
              HL.put(t.studSols[i], HL.prism(P, front, sO, sI, z1, z1 + 2.5));
            } else {
              HL.put(t.studSols[i], { sil: "", crease: "" });
            }
          } else {
            // Hidden inside the block above
            HL.put(t.studSols[i], { sil: "", crease: "" });
          }
        }

        // Render Top Block (index: count - 1)
        const topIdx = t.count - 1;
        const topBaseZ = 3 + topIdx * blockH + liftZ;
        const topRoofZ = topBaseZ + blockH;

        // Top block cube body (Strictly blockH = 13)
        const [topO, topI] = HL.rings(t.x - 9, -9, t.x + 9, 9, 2, 1);
        HL.put(t.blockSols[topIdx], HL.prism(P, front, topO, topI, topBaseZ, topRoofZ));

        // Top stud of top block
        const [tsO, tsI] = HL.rings(t.x - 3.5, -3.5, t.x + 3.5, 3.5, 3.5, 0.6);
        HL.put(t.studSols[topIdx], HL.prism(P, front, tsO, tsI, topRoofZ, topRoofZ + 2.5));

        // Internal socket hole (lỗ cắm âm) at the bottom face of detached top block
        if (isDetached) {
          // Socket opening rim at bottom face (z = topBaseZ)
          const rimPts = [];
          for (let k = 0; k <= 28; k++) {
            const a = (k / 28) * Math.PI * 2;
            rimPts.push(P(t.x + 3.6 * Math.cos(a), 3.6 * Math.sin(a), topBaseZ));
          }
          t.socketRimEl.style.display = "";
          t.socketRimEl.setAttribute("d", HL.poly(rimPts));

          // Socket depth ceiling inside block (z = topBaseZ + 2.5)
          const ceilPts = [];
          for (let k = 0; k <= 28; k++) {
            const a = (k / 28) * Math.PI * 2;
            ceilPts.push(P(t.x + 3.6 * Math.cos(a), 3.6 * Math.sin(a), topBaseZ + 2.5));
          }
          t.socketDepthEl.style.display = "";
          t.socketDepthEl.setAttribute("d", HL.poly(ceilPts));

          // Vertical alignment axis between lower stud and upper socket
          const lowerStudPeakZ = t.count === 1 ? 5.5 : (3 + (t.count - 1) * blockH + 2.5);
          t.alignGuideEl.style.display = "";
          t.alignGuideEl.setAttribute(
            "d",
            HL.seg(P(t.x, 0, lowerStudPeakZ), P(t.x, 0, topBaseZ))
          );
        } else {
          t.socketRimEl.style.display = "none";
          t.socketDepthEl.style.display = "none";
          t.alignGuideEl.style.display = "none";
        }
      });

      const anyDetached = towers.some(t => t.lift.x > 1.5);
      if (anyDetached) {
        read.textContent = "1 + 3 + 5 = 9 khối (Tách rời: lộ chốt tròn & lỗ cắm âm Unifix)";
      } else {
        read.textContent = "1 + 3 + 5 = 9 khối lập phương (Bảo toàn thể tích chuẩn Unifix)";
      }
    }

    function aim(pt) {
      if (!pt) {
        towers.forEach(t => (t.lift.t = 0));
        reg.wake();
        return;
      }
      towers.forEach(t => {
        const scr = P(t.x, 0, 30);
        const dist = Math.abs(pt[0] - scr[0]);
        // Snap-lift when hovered, spring snaps back when pointer leaves
        t.lift.t = dist < 26 ? 16 : 0;
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      towers.forEach(t => {
        if (HL.stepS(t.lift, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(
      HL.pointer(stage, {
        move: aim,
        leave: () => {
          towers.forEach(t => (t.lift.t = 0));
          reg.wake();
        }
      })
    );
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        // Slider sets target tower snap-lift
        const targetCount = Math.round(v);
        towers.forEach(t => {
          t.lift.t = t.count === targetCount ? 16 : 0;
        });
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
