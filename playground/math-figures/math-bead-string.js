export default {
    id: "math-bead-string",
    title: "10. Chuỗi 10 Hạt Đếm (Counting Bead String)",
    concept: "Tách gộp số 10 (bảng cộng phạm vi 10)",
    means: "Chuỗi 10 hạt đếm trên thanh uốn cong: 5 hạt đậm và 5 hạt nhạt; di chuột chia tách số 10 thành các cặp phép cộng (7 + 3, 6 + 4, 8 + 2).",
    rules: [1, 2, 3, 7, 10],
    range: [0, 5, 10],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-58, -16, 0], [58, 16, 45]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Wooden base (Z: 0 to 4)
      const [bO, bI] = HL.rings(-52, -14, 52, 14, 3, 1.5);
      const baseSol = HL.solid(svg);
      HL.put(baseSol, HL.prism(P, front, bO, bI, 0, 4));

      // Sockets for wire anchors on base
      HL.mk("circle", { cx: P(-44, 0, 4.1)[0], cy: P(-44, 0, 4.1)[1], r: 2.5, fill: "#232327" }, svg);
      HL.mk("circle", { cx: P(44, 0, 4.1)[0], cy: P(44, 0, 4.1)[1], r: 2.5, fill: "#232327" }, svg);

      // Parabolic Wire on X-Z plane: z = 4 + 136 * t * (1 - t)
      const wirePts = [];
      for (let s = 0; s <= 48; s++) {
        const t = s / 48;
        const x = HL.lerp(-44, 44, t);
        const z = 4 + 136 * t * (1 - t);
        wirePts.push(P(x, 0, z));
      }
      HL.mk("path", { d: HL.open(wirePts), stroke: "#232327", fill: "none", "stroke-width": 1.6 }, svg);

      // 10 Beads: 5 Dark (first 5) and 5 Light (last 5) for Base-5 grouping
      const beads = [];
      const R = 4.2;      // outer bead radius
      const L = 5.2;      // bead length along wire
      const r_hole = 1.3; // bead hole radius
      const N = 24;       // circular sampling points

      for (let i = 0; i < 10; i++) {
        const dark = i < 5;
        const sol = HL.solid(svg);
        if (dark) {
          sol.sil.style.fill = "#232327";
          sol.sil.style.stroke = "#111113";
          sol.sil.style.strokeWidth = "1.2px";
          sol.cr.style.stroke = "#e0e0e4";
          sol.cr.style.strokeWidth = "1px";
        } else {
          sol.sil.style.fill = "#ffffff";
          sol.sil.style.stroke = "#232327";
          sol.sil.style.strokeWidth = "1.2px";
          sol.cr.style.stroke = "#5b5d64";
          sol.cr.style.strokeWidth = "1px";
        }

        // Initial 5 + 5 split
        const initialT = i < 5 ? 0.06 + i * 0.048 : 0.94 - (9 - i) * 0.048;
        beads.push({
          idx: i,
          dark,
          tSp: HL.spring(initialT, { k: 130, c: 14 }),
          sol
        });
      }

      function draw() {
        beads.forEach(b => {
          const t = b.tSp.x;
          const x = -44 + 88 * t;
          const z = 4 + 136 * t * (1 - t);

          // Tangent vector along wire parabola
          const tx = 88;
          const tz = 136 * (1 - 2 * t);
          const len = Math.hypot(tx, tz);
          const utx = tx / len;
          const utz = tz / len;

          // Orthonormal basis:
          // Axis A = (utx, 0, utz) along the wire
          // Vy = (0, 1, 0)
          // Vn = (-utz, 0, utx)
          const end1 = [], end2 = [];
          const hole1 = [], hole2 = [];
          for (let k = 0; k < N; k++) {
            const ang = (k / N) * Math.PI * 2;
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);

            // Outer rim End 1 (at -L/2)
            const p1x = x - (L / 2) * utx + R * sinA * (-utz);
            const p1y = R * cosA;
            const p1z = z - (L / 2) * utz + R * sinA * utx;
            end1.push(P(p1x, p1y, p1z));

            // Outer rim End 2 (at +L/2)
            const p2x = x + (L / 2) * utx + R * sinA * (-utz);
            const p2y = R * cosA;
            const p2z = z + (L / 2) * utz + R * sinA * utx;
            end2.push(P(p2x, p2y, p2z));

            // Hole End 1
            const h1x = x - (L / 2) * utx + r_hole * sinA * (-utz);
            const h1y = r_hole * cosA;
            const h1z = z - (L / 2) * utz + r_hole * sinA * utx;
            hole1.push(P(h1x, h1y, h1z));

            // Hole End 2
            const h2x = x + (L / 2) * utx + r_hole * sinA * (-utz);
            const h2y = r_hole * cosA;
            const h2z = z + (L / 2) * utz + r_hole * sinA * utx;
            hole2.push(P(h2x, h2y, h2z));
          }

          // Outer silhouette: convex hull of End 1 and End 2 rims
          const sil = HL.poly(HL.hull(end1.concat(end2)));

          // Visible end face based on dot product of A with camera vector (0.3536, 0.3536, 0.866)
          const dotEnd2 = utx * 0.3536 + utz * 0.866;
          const visRim = dotEnd2 > 0 ? end2 : end1;
          const visHole = dotEnd2 > 0 ? hole2 : hole1;

          // Crease: visible rim ellipse + visible center hole
          const crease = HL.poly(visRim) + HL.poly(visHole);

          HL.put(b.sol, { sil, crease });
        });

        const leftCount = beads.filter(b => b.tSp.x < 0.5).length;
        const rightCount = 10 - leftCount;
        const leftDark = Math.min(5, leftCount);
        const leftLight = Math.max(0, leftCount - 5);
        const rightDark = Math.max(0, 5 - leftCount);
        const rightLight = 5 - leftLight;
        read.textContent = "Tách gộp số 10: " + leftCount + " + " + rightCount + " = 10 (" + leftDark + " đậm, " + leftLight + " sáng | " + rightDark + " đậm, " + rightLight + " sáng)";
      }

      let curSplit = 5;

      function setSplit(splitIdx) {
        curSplit = HL.clamp(splitIdx, 0, 10);
        beads.forEach((b, i) => {
          if (i < curSplit) {
            b.tSp.t = 0.06 + i * 0.048;
          } else {
            b.tSp.t = 0.94 - (9 - i) * 0.048;
          }
        });
        reg.wake();
      }

      function aim(pt) {
        if (!pt) return;
        const scrLeft = P(-44, 0, 4)[0];
        const scrRight = P(44, 0, 4)[0];
        const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0.05, 0.95);
        const splitIdx = Math.round(norm * 10);
        setSplit(splitIdx);
      }

      function handleClick(pt) {
        if (!pt) {
          setSplit((curSplit + 1) % 11);
          return;
        }
        const scrLeft = P(-44, 0, 4)[0];
        const scrRight = P(44, 0, 4)[0];
        const norm = HL.clamp((pt[0] - scrLeft) / (scrRight - scrLeft), 0, 1);
        const splitIdx = Math.round(norm * 10);
        if (Math.abs(splitIdx - curSplit) < 1) {
          setSplit((curSplit + 1) % 11);
        } else {
          setSplit(splitIdx);
        }
      }

      const reg = HL.register(stage, dt => {
        let moving = false;
        beads.forEach(b => { if (HL.stepS(b.tSp, dt)) moving = true; });
        draw();
        return moving;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, down: handleClick, leave: () => {} }));
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
