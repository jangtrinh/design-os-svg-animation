export default {
    id: "math-dice",
    title: "6. Cặp Xúc Xắc (Math Dice Pips)",
    concept: "Phép cộng trực quan bằng chấm đố",
    means: "Hai khối xúc xắc lập phương: mặt trên hiển thị 3 chấm và 4 chấm; di chuột để xúc xắc nghiêng xoay theo góc nhìn 3D.",
    rules: [1, 2, 4, 6, 9],
    range: [0, 3.5, 7],
    mount({ stage, svg, read }, initialV) {
      const bag = HL.disposer();
      const C = HL.Cam(45, 0.5, 1.85);
      HL.fit(C, [[-48, -22, 0], [48, 22, 38]], 200, 160);
      const P = HL.proj(C), front = HL.facing(C);

      // Felt Gaming Mat Base
      const [matO, matI] = HL.rings(-44, -18, 44, 18, 4, 1.5);
      const matSol = HL.solid(svg);
      HL.put(matSol, HL.prism(P, front, matO, matI, 0, 2));

      // Dice Groups
      const d1Group = HL.mk("g", { id: "die-1" }, svg);
      const d2Group = HL.mk("g", { id: "die-2" }, svg);

      // Faces for Die 1: Front-Right (+X), Front-Left (+Y), Top (+Z)
      const d1FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
      const d1FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);
      const d1FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d1Group);

      // Faces for Die 2: Front-Right (+X), Front-Left (+Y), Top (+Z)
      const d2FaceX = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
      const d2FaceY = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);
      const d2FaceZ = HL.mk("polygon", { style: "fill: #ffffff; stroke: #232327; stroke-width: 1.2; stroke-linejoin: round;" }, d2Group);

      // Pips: Die 1 has Top(3), Left(1), Right(2) -> 6 pips
      const d1Pips = [];
      for (let i = 0; i < 6; i++) {
        d1Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d1Group));
      }

      // Pips: Die 2 has Top(4), Left(5), Right(6) -> 15 pips
      const d2Pips = [];
      for (let i = 0; i < 15; i++) {
        d2Pips.push(HL.mk("path", { style: "fill: #232327; stroke: none;" }, d2Group));
      }

      // 3D Springs for tilt/wobble and lift
      const wobbleX1 = HL.spring(0, { k: 120, c: 14 });
      const wobbleY1 = HL.spring(0, { k: 120, c: 14 });
      const lift1 = HL.spring(0, { k: 130, c: 15 });

      const wobbleX2 = HL.spring(0, { k: 120, c: 14 });
      const wobbleY2 = HL.spring(0, { k: 120, c: 14 });
      const lift2 = HL.spring(0, { k: 130, c: 15 });

      // 3D Rotation helper around cube center
      function rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz) {
        const rx = HL.rad(rxDeg);
        const ry = HL.rad(ryDeg);
        // Roll around Y
        const x1 = lx * Math.cos(ry) + lz * Math.sin(ry);
        const y1 = ly;
        const z1 = -lx * Math.sin(ry) + lz * Math.cos(ry);
        // Pitch around X
        const x2 = x1;
        const y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
        return [cx + x2, cy + y2, cz + z2];
      }

      // Project a 3D circular pip in local plane coordinates to screen path
      // normalAxis: 'z' (top), 'y' (front-left), 'x' (front-right)
      function projectPip(cu, cv, r, normalAxis, rxDeg, ryDeg, cx, cy, cz) {
        const N = 12;
        const pts = [];
        for (let i = 0; i < N; i++) {
          const theta = (i / N) * Math.PI * 2;
          const u = cu + r * Math.cos(theta);
          const v = cv + r * Math.sin(theta);
          let lx, ly, lz;
          if (normalAxis === 'z') {
            lx = u; ly = v; lz = 10.05;
          } else if (normalAxis === 'y') {
            lx = u; ly = 10.05; lz = v;
          } else { // 'x'
            lx = 10.05; ly = u; lz = v;
          }
          const wPt = rotatePoint(lx, ly, lz, rxDeg, ryDeg, cx, cy, cz);
          pts.push(P(...wPt));
        }
        return HL.poly(pts);
      }

      function drawDie(cx, baseZ, rxDeg, ryDeg, faceX, faceY, faceZ, pips, pipConfig) {
        const s = 10;
        const cz = baseZ + s;

        // 8 Corners of the rotated cube
        const c_000 = rotatePoint(-s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_100 = rotatePoint( s, -s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_010 = rotatePoint(-s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_110 = rotatePoint( s,  s, -s, rxDeg, ryDeg, cx, 0, cz);
        const c_001 = rotatePoint(-s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
        const c_101 = rotatePoint( s, -s,  s, rxDeg, ryDeg, cx, 0, cz);
        const c_011 = rotatePoint(-s,  s,  s, rxDeg, ryDeg, cx, 0, cz);
        const c_111 = rotatePoint( s,  s,  s, rxDeg, ryDeg, cx, 0, cz);

        // 1. Front-Right face (+X): c_100 -> c_110 -> c_111 -> c_101
        const ptsX = [P(...c_100), P(...c_110), P(...c_111), P(...c_101)];
        faceX.setAttribute("points", ptsX.map(p => p.map(HL.r2).join(",")).join(" "));

        // 2. Front-Left face (+Y): c_010 -> c_110 -> c_111 -> c_011
        const ptsY = [P(...c_010), P(...c_110), P(...c_111), P(...c_011)];
        faceY.setAttribute("points", ptsY.map(p => p.map(HL.r2).join(",")).join(" "));

        // 3. Top face (+Z): c_001 -> c_101 -> c_111 -> c_011
        const ptsZ = [P(...c_001), P(...c_101), P(...c_111), P(...c_011)];
        faceZ.setAttribute("points", ptsZ.map(p => p.map(HL.r2).join(",")).join(" "));

        // Render each pip projected onto its respective tilted face
        let pipIdx = 0;
        pipConfig.forEach(cfg => {
          const pathStr = projectPip(cfg.u, cfg.v, cfg.r, cfg.axis, rxDeg, ryDeg, cx, 0, cz);
          pips[pipIdx].setAttribute("d", pathStr);
          pipIdx++;
        });
      }

      // Standard Pip Positions on a 20x20 face
      const d = 5.2;
      const rStandard = 1.55;
      const rCenter = 1.75;

      // Die 1: Top=3 (axis z), Left=1 (axis y), Right=2 (axis x)
      const d1Config = [
        // Right face (+X): 2 pips
        { axis: 'x', u: -d, v:  d, r: rStandard },
        { axis: 'x', u:  d, v: -d, r: rStandard },
        // Left face (+Y): 1 pip
        { axis: 'y', u:  0, v:  0, r: rCenter },
        // Top face (+Z): 3 pips
        { axis: 'z', u: -d, v: -d, r: rStandard },
        { axis: 'z', u:  0, v:  0, r: rCenter },
        { axis: 'z', u:  d, v:  d, r: rStandard }
      ];

      // Die 2: Top=4 (axis z), Left=5 (axis y), Right=6 (axis x)
      const d2Config = [
        // Right face (+X): 6 pips
        { axis: 'x', u: -d, v: -d, r: rStandard },
        { axis: 'x', u:  d, v: -d, r: rStandard },
        { axis: 'x', u: -d, v:  0, r: rStandard },
        { axis: 'x', u:  d, v:  0, r: rStandard },
        { axis: 'x', u: -d, v:  d, r: rStandard },
        { axis: 'x', u:  d, v:  d, r: rStandard },
        // Left face (+Y): 5 pips
        { axis: 'y', u: -d, v: -d, r: rStandard },
        { axis: 'y', u:  d, v: -d, r: rStandard },
        { axis: 'y', u:  0, v:  0, r: rCenter },
        { axis: 'y', u: -d, v:  d, r: rStandard },
        { axis: 'y', u:  d, v:  d, r: rStandard },
        // Top face (+Z): 4 pips
        { axis: 'z', u: -d, v: -d, r: rStandard },
        { axis: 'z', u:  d, v: -d, r: rStandard },
        { axis: 'z', u: -d, v:  d, r: rStandard },
        { axis: 'z', u:  d, v:  d, r: rStandard }
      ];

      function draw() {
        const baseZ1 = 2 + lift1.x;
        const baseZ2 = 2 + lift2.x;

        drawDie(-22, baseZ1, wobbleX1.x, wobbleY1.x, d1FaceX, d1FaceY, d1FaceZ, d1Pips, d1Config);
        drawDie( 22, baseZ2, wobbleX2.x, wobbleY2.x, d2FaceX, d2FaceY, d2FaceZ, d2Pips, d2Config);

        read.textContent = "Xúc xắc 3D: Mặt trên 3 + 4 = 7 (Tổng 2 mặt đối diện = 7)";
      }

      function aim(pt) {
        if (!pt) {
          wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
          wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
          reg.wake();
          return;
        }

        const p1Scr = P(-22, 0, 12);
        const p2Scr = P( 22, 0, 12);

        const dist1 = Math.hypot(pt[0] - p1Scr[0], pt[1] - p1Scr[1]);
        const dist2 = Math.hypot(pt[0] - p2Scr[0], pt[1] - p2Scr[1]);

        if (dist1 < 45) {
          wobbleX1.t = HL.clamp((pt[1] - p1Scr[1]) * 0.35, -8, 8);
          wobbleY1.t = HL.clamp(-(pt[0] - p1Scr[0]) * 0.35, -8, 8);
          lift1.t = 2.5;
        } else {
          wobbleX1.t = 0; wobbleY1.t = 0; lift1.t = 0;
        }

        if (dist2 < 45) {
          wobbleX2.t = HL.clamp((pt[1] - p2Scr[1]) * 0.35, -8, 8);
          wobbleY2.t = HL.clamp(-(pt[0] - p2Scr[0]) * 0.35, -8, 8);
          lift2.t = 2.5;
        } else {
          wobbleX2.t = 0; wobbleY2.t = 0; lift2.t = 0;
        }

        reg.wake();
      }

      const reg = HL.register(stage, dt => {
        const m1 = HL.stepS(wobbleX1, dt) || HL.stepS(wobbleY1, dt) || HL.stepS(lift1, dt);
        const m2 = HL.stepS(wobbleX2, dt) || HL.stepS(wobbleY2, dt) || HL.stepS(lift2, dt);
        draw();
        return m1 || m2;
      });
      bag.add(reg.unregister);
      bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
      bag.add(() => svg.replaceChildren());

      draw();
      return {
        set(v) {
          const t = (v - 3.5) / 3.5;
          wobbleY1.t = t * 7;
          wobbleY2.t = -t * 7;
          lift1.t = Math.abs(t) * 2;
          lift2.t = Math.abs(t) * 2;
          reg.wake();
        },
        destroy: bag.dispose
      };
    }
  };
