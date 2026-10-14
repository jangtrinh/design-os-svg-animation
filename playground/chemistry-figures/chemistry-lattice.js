/*
 * 3. Crystal Lattice Structure (Mạng Tinh Thể Lập Phương NaCl)
 * Face-Centered Cubic (FCC) rock-salt lattice: Na⁺ (r = 102 pm) & Cl⁻ (r = 181 pm), r₀ = 282 pm, CN = 6.
 */

export default {
  id: "chemistry-lattice",
  title: "3. Mạng Tinh Thể NaCl (Crystal Lattice)",
  concept: "Cấu trúc tinh thể ion: Cation Na⁺ & Anion Cl⁻ xen kẽ · Cân bằng thế năng Coulomb & Born",
  means: "Di chuột co dãn khoảng cách giữa các ion trong ô mạng lập phương. Khi đạt khoảng cách cân bằng bền (r = 282 pm), thế năng liên kết ion đạt cực tiểu, mạng tinh thể đạt trạng thái bền vững tuyệt đối.",
  rules: [1, 2, 4, 6, 9],
  range: [220, 282, 340],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.65);
    HL.fit(C, [[-32, -18, 0], [32, 18, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Showcase Pedestal Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-30, -16, 30, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    HL.mk("path", {
      class: "nf dash",
      d: HL.seg(P(-22, 0, 2.6), P(22, 0, 2.6)) + HL.seg(P(0, -12, 2.6), P(0, 12, 2.6))
    }, svg);

    // 2. 3x3x3 Cubic Lattice Centered at (0, 0, 20.5)
    const centerZ = 20.5;
    const outerBondPath = HL.mk("path", { class: "nf lo" }, svg);
    const octaCagePath = HL.mk("path", { class: "nf dash" }, svg);
    const focalBondPath = HL.mk("path", { class: "nf hi" }, svg);
    const ionGroup = HL.mk("g", {}, svg);

    const spR = HL.spring(initialV != null ? initialV : 282, { k: 130, c: 15 });
    let hoveredIdx = -1;
    let lastKey = "";

    // 27 Ion Spheres sorted back-to-front in 2:1 axonometric depth (ix + iy + iz)
    const ions = [];
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const isCl = (Math.abs(ix + iy + iz) % 2) === 1;
          const radius = isCl ? 4.2 : 2.6;
          const isCenter = ix === 0 && iy === 0 && iz === 0;
          ions.push({ ix, iy, iz, isCl, isCenter, radius });
        }
      }
    }

    ions.sort((a, b) => (a.ix + a.iy + a.iz * 0.85) - (b.ix + b.iy + b.iz * 0.85));

    ions.forEach((ion, idx) => {
      ion.idx = idx;
      const g = HL.mk("g", {}, ionGroup);
      ion.disc = HL.mk("path", { class: ion.isCenter ? "sil hi" : (ion.isCl ? "sil" : "lo") }, g);
      ion.latRing = HL.mk("path", { class: "nf lo" }, g);
    });

    function draw() {
      const r = spR.x;
      const key = `${HL.r2(r)}:${hoveredIdx}`;
      if (key === lastKey) return;
      lastKey = key;

      const d = (r / 282.0) * 9.6;
      const isEquil = Math.abs(r - 282) < 4.5;

      // Build lattice bonds: separate 6 central octahedral coordination bonds from outer lattice bonds
      let outD = "", focD = "";
      for (let axis = 0; axis < 3; axis++) {
        for (let a = -1; a <= 1; a++) {
          for (let b = -1; b <= 1; b++) {
            for (let c = -1; c <= 0; c++) {
              const p0 = axis === 0 ? P(c * d, a * d, centerZ + b * d)
                : axis === 1 ? P(a * d, c * d, centerZ + b * d)
                : P(a * d, b * d, centerZ + c * d);
              const p1 = axis === 0 ? P((c + 1) * d, a * d, centerZ + b * d)
                : axis === 1 ? P(a * d, (c + 1) * d, centerZ + b * d)
                : P(a * d, b * d, centerZ + (c + 1) * d);
              if (a === 0 && b === 0) {
                focD += HL.seg(p0, p1);
              } else {
                outD += HL.seg(p0, p1);
              }
            }
          }
        }
      }
      outerBondPath.setAttribute("d", outD);
      focalBondPath.setAttribute("d", focD);

      // Coordination Octahedron Cage connecting the 6 nearest neighbors of (0,0,0)
      const oct = [
        P(d, 0, centerZ), P(0, d, centerZ), P(-d, 0, centerZ), P(0, -d, centerZ),
        P(0, 0, centerZ + d), P(0, 0, centerZ - d)
      ];
      let cageD = HL.poly([oct[0], oct[1], oct[2], oct[3]]);
      for (let k = 0; k < 4; k++) {
        cageD += HL.seg(oct[4], oct[k]) + HL.seg(oct[5], oct[k]);
      }
      octaCagePath.setAttribute("d", cageD);
      octaCagePath.classList.toggle("hi", isEquil);

      // Update 27 Ion Spheres (Cl⁻: sil + nf lo latitude ring; Na⁺: lo; central/hovered: hi)
      ions.forEach(ion => {
        const pt = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const rv = ion.radius;
        const discPts = [], latPts = [];
        for (let a = 0; a < 18; a++) {
          const ang = (a * 2 * Math.PI) / 18;
          const ca = Math.cos(ang), sa = Math.sin(ang);
          discPts.push([pt[0] + rv * ca, pt[1] + rv * sa]);
          latPts.push([pt[0] + rv * 0.72 * ca, pt[1] + rv * 0.34 * sa]);
        }
        ion.disc.setAttribute("d", HL.poly(discPts));
        ion.latRing.setAttribute("d", ion.isCl ? HL.poly(latPts) : HL.seg([pt[0] - 0.9, pt[1]], [pt[0] + 0.9, pt[1]]));

        const isFoc = ion.isCenter || ion.idx === hoveredIdx;
        ion.disc.classList.toggle("hi", isFoc);
      });

      const ratio = 282.0 / r;
      const uLat = Math.round(-898.3 * (ratio - (1 / 8) * Math.pow(ratio, 8)));
      read.textContent = isEquil
        ? `r=${Math.round(r)}pm · U=${uLat}kJ [BỀN]`
        : `r=${Math.round(r)}pm · U=${uLat}kJ/mol`;
    }

    function setDistance(val) {
      spR.t = HL.clamp(val, 220, 340);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        hoveredIdx = -1;
        setDistance(282.0);
        return;
      }
      const w = HL.unproj(C, pt[0], pt[1], centerZ);
      const norm = HL.clamp((w[0] - w[1] + 24) / 48, 0, 1);
      setDistance(220 + norm * 120.0);

      const d = (spR.x / 282.0) * 9.6;
      let best = -1, bestDist = 14;
      ions.forEach(ion => {
        const p = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const dist = Math.hypot(pt[0] - p[0], pt[1] - p[1]);
        if (dist < bestDist) { bestDist = dist; best = ion.idx; }
      });
      hoveredIdx = best;
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spR, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, down: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return { set(v) { setDistance(Number(v)); }, destroy: bag.dispose, dispose: bag.dispose };
  }
};
