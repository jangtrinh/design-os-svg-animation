/*
 * 10. Counting Bead String (Chuỗi 10 Hạt Đếm Số)
 * Authentic Grade 1 Pedagogical Manipulative: Part-Whole Decompositions of 10 (7+3, 6+4, 8+2)
 * Lucas Markes Hairline Standard:
 * - Turned hardwood baseboard with beveled edges (r=4.0, b=1.4) & 4 corner foot pads
 * - Turned brass wire mounting posts with collar rings at wire anchor roots
 * - Precision bi-conical Soroban abacus beads with sharp equatorial ridge rings & center wire bores
 * - 5 ivory + 5 ebony beads for instant Grade 1 subitizing
 * - Continuous pointer tracking with spring partition kinematics & focal highlight transfer
 * - Pure 2:1 axonometric line art, zero SVG text
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-60, -18, 0], [60, 18, 48]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Turned Hardwood Baseboard (Z: 0 to 4.5)
    const [bO, bI] = HL.rings(-54, -16, 54, 16, 4.0, 1.4);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4.5));

    // Four corner foot pads
    for (const [fx, fy] of [[-48, -11], [48, -11], [-48, 11], [48, 11]]) {
      const [fO] = HL.rings(fx - 2.8, fy - 2.8, fx + 2.8, fy + 2.8, 2.8, 0.5);
      HL.mk("path", { class: "lo nf", d: HL.poly(HL.ringAt(P, fO, 0)) }, svg);
    }

    // 2. Turned Brass Mounting Posts at Wire Anchors (X = -44, X = 44)
    for (const bx of [-44, 44]) {
      const [postO, postI] = HL.rings(bx - 3.8, -3.8, bx + 3.8, 3.8, 3.8, 0.6);
      const postSol = HL.solid(svg);
      HL.put(postSol, HL.prism(P, front, postO, postI, 4.5, 7.5));

      const centerScr = P(bx, 0, 7.6);
      HL.mk("circle", { cx: HL.r2(centerScr[0]), cy: HL.r2(centerScr[1]), r: 1.6, fill: "#232327" }, svg);
    }

    // 3. Parabolic Brass Wire on X-Z Plane
    const wirePts = [];
    for (let s = 0; s <= 48; s++) {
      const t = s / 48;
      const x = HL.lerp(-44, 44, t);
      const z = 7.5 + 130 * t * (1 - t);
      wirePts.push(P(x, 0, z));
    }
    HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.6 }, svg);

    // 4. Ten Precision Bi-Conical Abacus Beads
    // 5 Ebony (dark) + 5 Ivory (light)
    const beads = [];
    const R_mid = 5.2;   // Midpoint ridge radius
    const R_end = 2.8;   // End rims radius
    const L = 5.6;       // Bead length along wire
    const r_hole = 1.3;  // Center bore hole radius
    const N = 24;

    for (let i = 0; i < 10; i++) {
      const dark = i < 5;
      const sol = HL.solid(svg);
      if (dark) {
        sol.sil.style.fill = "#232327";
        sol.sil.style.stroke = "#111113";
        sol.sil.style.strokeWidth = "1.2px";
        sol.cr.style.stroke = "#e0e0e4";
        sol.cr.style.strokeWidth = "1.0px";
      } else {
        sol.sil.style.fill = "#ffffff";
        sol.sil.style.stroke = "#232327";
        sol.sil.style.strokeWidth = "1.2px";
        sol.cr.style.stroke = "#5b5d64";
        sol.cr.style.strokeWidth = "1.0px";
      }

      // Initial 5 + 5 split
      const initialT = i < 5 ? 0.08 + i * 0.048 : 0.92 - (9 - i) * 0.048;
      beads.push({
        idx: i,
        dark,
        tSp: HL.spring(initialT, { k: 130, c: 14 }),
        sol
      });
    }

    let curSplit = 5;

    function draw() {
      beads.forEach(b => {
        const t = b.tSp.x;
        const x = -44 + 88 * t;
        const z = 7.5 + 130 * t * (1 - t);

        // Tangent vector along wire
        const tx = 88;
        const tz = 130 * (1 - 2 * t);
        const len = Math.hypot(tx, tz);
        const utx = tx / len;
        const utz = tz / len;

        // Orthogonal vectors
        const end1 = [], end2 = [], midRing = [];
        const hole1 = [], hole2 = [];

        for (let k = 0; k < N; k++) {
          const ang = (k / N) * Math.PI * 2;
          const cosA = Math.cos(ang);
          const sinA = Math.sin(ang);

          // End 1 (at -L/2)
          const p1x = x - (L / 2) * utx + R_end * sinA * (-utz);
          const p1y = R_end * cosA;
          const p1z = z - (L / 2) * utz + R_end * sinA * utx;
          end1.push(P(p1x, p1y, p1z));

          // Midpoint Equatorial Ridge Ring (at 0)
          const pmx = x + R_mid * sinA * (-utz);
          const pmy = R_mid * cosA;
          const pmz = z + R_mid * sinA * utx;
          midRing.push(P(pmx, pmy, pmz));

          // End 2 (at +L/2)
          const p2x = x + (L / 2) * utx + R_end * sinA * (-utz);
          const p2y = R_end * cosA;
          const p2z = z + (L / 2) * utz + R_end * sinA * utx;
          end2.push(P(p2x, p2y, p2z));

          // Hole 1
          hole1.push(P(x - (L / 2) * utx + r_hole * sinA * (-utz), r_hole * cosA, z - (L / 2) * utz + r_hole * sinA * utx));
          // Hole 2
          hole2.push(P(x + (L / 2) * utx + r_hole * sinA * (-utz), r_hole * cosA, z + (L / 2) * utz + r_hole * sinA * utx));
        }

        // Outer silhouette: hull of End 1, Mid Ring, and End 2
        const sil = HL.poly(HL.hull(end1.concat(midRing).concat(end2)));

        // Camera direction test
        const dotEnd2 = utx * 0.3536 + utz * 0.866;
        const visRim = dotEnd2 > 0 ? end2 : end1;
        const visHole = dotEnd2 > 0 ? hole2 : hole1;

        // Crease: equatorial sharp ridge ring + visible bore hole
        const crease = HL.poly(midRing) + HL.poly(visRim) + HL.poly(visHole);

        HL.put(b.sol, { sil, crease });

        // Highlight active parting boundary bead
        const isFocal = (b.idx === curSplit - 1);
        b.sol.sil.classList.toggle("hi", isFocal);
      });

      const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
      const rightCount = 10 - leftCount;
      read.textContent = "Bead String: " + leftCount + " + " + rightCount + " = 10";
    }

    function setSplit(splitIdx) {
      curSplit = HL.clamp(splitIdx, 0, 10);
      beads.forEach((b, i) => {
        if (i < curSplit) {
          b.tSp.t = 0.08 + i * 0.048;
        } else {
          b.tSp.t = 0.92 - (9 - i) * 0.048;
        }
      });
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setSplit(5);
        return;
      }
      const scrLeft = P(-44, 0, 8)[0];
      const scrRight = P(44, 0, 8)[0];
      const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0.05, 0.95);
      const splitIdx = Math.round(norm * 10);
      setSplit(splitIdx);
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, {
      move: aim,
      leave: () => setSplit(5)
    }));
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
