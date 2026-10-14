/*
 * 10. Counting Bead String (Chuỗi 10 Hạt Đếm Số)
 * Pedagogical Goal: Part-whole decompositions of 10 (7+3, 6+4, 8+2)
 */

export default {
  id: "math-bead-string",
  title: "10. Chuỗi 10 Hạt Đếm (Counting Bead String)",
  concept: "Tách gộp số 10 (bảng cộng phạm vi 10)",
  means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt ngà và 5 hạt gỗ mun; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2) mượt mà.",
  rules: [1, 2, 3, 7, 9],
  range: [0, 5, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.0);
    HL.fit(C, [[-52, -14, 0], [52, 14, 38]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Clean Wooden Baseboard (Z: 0 to 4.0)
    const [bO, bI] = HL.rings(-52, -14, 52, 14, 3.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4.0));

    // Anchor sockets for wire on base
    const sL = HL.flatDot(svg, C, 1.5, "dot m");
    const sR = HL.flatDot(svg, C, 1.5, "dot m");
    HL.place(sL, P(-44, 0, 4.1));
    HL.place(sR, P(44, 0, 4.1));

    // 2. Parabolic Wire on X-Z Plane
    const wirePts = [];
    for (let s = 0; s <= 40; s++) {
      const t = s / 40;
      wirePts.push(P(HL.lerp(-44, 44, t), 0, 4.0 + 130 * t * (1 - t)));
    }
    HL.mk("path", { class: "nf sil", d: HL.open(wirePts) }, svg);

    // 3. Ten Clean Counting Beads (5 group A + 5 group B)
    let curSplit = initialV != null ? HL.clamp(Math.round(initialV), 0, 10) : 5;
    const beads = [];
    const R = 4.5;
    const L = 5.2;
    const rHole = 1.2;
    const N = 20;

    for (let i = 0; i < 10; i++) {
      const groupA = i < 5;
      const sol = HL.solid(svg);
      const dot = groupA ? HL.flatDot(svg, C, 0.9, "dot m") : null;
      const initialT = i < curSplit ? 0.08 + i * 0.048 : 0.92 - (9 - i) * 0.048;
      beads.push({
        idx: i,
        groupA,
        tSp: HL.spring(initialT, { k: 130, c: 14 }),
        sol,
        dot
      });
    }

    let lastKey = "";

    function draw() {
      const key = `${curSplit}:${beads.map(b => HL.r2(b.tSp.x)).join(",")}`;
      if (key === lastKey) return;
      lastKey = key;

      beads.forEach(b => {
        const t = b.tSp.x;
        const x = -44 + 88 * t;
        const z = 4.0 + 130 * t * (1 - t);

        const tx = 88;
        const tz = 130 * (1 - 2 * t);
        const len = Math.hypot(tx, tz);
        const utx = tx / len;
        const utz = tz / len;

        const end1 = [], end2 = [];
        const hole1 = [], hole2 = [];

        for (let k = 0; k < N; k++) {
          const ang = (k / N) * Math.PI * 2;
          const cosA = Math.cos(ang);
          const sinA = Math.sin(ang);

          end1.push(P(x - (L / 2) * utx + R * sinA * (-utz), R * cosA, z - (L / 2) * utz + R * sinA * utx));
          end2.push(P(x + (L / 2) * utx + R * sinA * (-utz), R * cosA, z + (L / 2) * utz + R * sinA * utx));
          hole1.push(P(x - (L / 2) * utx + rHole * sinA * (-utz), rHole * cosA, z - (L / 2) * utz + rHole * sinA * utx));
          hole2.push(P(x + (L / 2) * utx + rHole * sinA * (-utz), rHole * cosA, z + (L / 2) * utz + rHole * sinA * utx));
        }

        const sil = HL.poly(HL.hull(end1.concat(end2)));
        const dotEnd2 = utx * 0.3536 + utz * 0.866;
        const visRim = dotEnd2 > 0 ? end2 : end1;
        const visHole = dotEnd2 > 0 ? hole2 : hole1;
        const crease = HL.poly(visRim) + HL.poly(visHole);

        HL.put(b.sol, { sil, crease });
        if (b.dot) HL.place(b.dot, P(x, 0, z + R * 0.75));

        const focalIdx = Math.max(0, curSplit - 1);
        b.sol.sil.classList.toggle("hi", b.idx === focalIdx);
      });

      const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
      const rightCount = 10 - leftCount;
      read.textContent = `Chuỗi hạt: ${leftCount} + ${rightCount} = 10`;
    }

    function setSplit(splitIdx) {
      curSplit = HL.clamp(splitIdx, 0, 10);
      beads.forEach((b, i) => {
        b.tSp.t = i < curSplit ? 0.08 + i * 0.048 : 0.92 - (9 - i) * 0.048;
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSplit(5);
        return;
      }
      const [wx, wy] = HL.unproj(C, pt[0], pt[1], 15.0);
      const axis = (wx - wy) * Math.SQRT1_2;
      const norm = HL.clamp((axis + 32) / 64, 0.05, 0.95);
      setSplit(Math.round(norm * 10));
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => setSplit(5) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setSplit(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
};
