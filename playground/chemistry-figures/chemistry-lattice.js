/*
 * 3. Crystal Lattice Structure (Mạng Tinh Thể Lập Phương NaCl)
 * Chemical Concept: Mạng tinh thể ion lập phương tâm mặt (FCC - Face-Centered Cubic):
 *   - Xen kẽ giữa cation Na⁺ (bán kính nhỏ r = 102 pm) và anion Cl⁻ (bán kính lớn r = 181 pm).
 *   - Lực liên kết ion: Cân bằng giữa lực hút tĩnh điện Coulomb F_hút ~ 1/r²
 *     và lực đẩy tương tác đám mây electron F_đẩy ~ 1/r¹² (Hố thế Born-Mayer).
 *   - Khoảng cách cân bằng bền: r₀ = 282 pm; Năng lượng mạng tinh thể: U = -786 kJ/mol.
 * Geometry: Bệ đỡ tiêu bản tròn/chữ nhật, 27 nút mạng ion đặc xen kẽ (Na⁺ & Cl⁻),
 *   các thanh liên kết tinh thể trực giao theo 3 trục không gian X, Y, Z.
 * Kinematics: Di chuột để kéo dãn hoặc nén mạng tinh thể; các liên kết co giãn đàn hồi theo HL.spring.
 *   Khi mạng đạt đúng khoảng cách cân bằng r₀, toàn bộ liên kết tâm kích hoạt trạng thái bền .hi.
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
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 42]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Showcase Pedestal Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Base coordinate grid lines
    HL.mk("line", {
      x1: HL.r2(P(-24, 0, 2.6)[0]), y1: HL.r2(P(-24, 0, 2.6)[1]),
      x2: HL.r2(P(24, 0, 2.6)[0]), y2: HL.r2(P(24, 0, 2.6)[1]),
      class: "lo", "stroke-width": 0.8, "stroke-dasharray": "3 2"
    }, svg);

    // 2. Crystal Lattice Nodes & Bonds
    // We construct a 3x3x3 cubic lattice centered at (0, 0, 22)
    // Indices i, j, k in [-1, 0, 1]
    const centerZ = 22.0;
    const bondGroup = HL.mk("g", {}, svg);
    const ionGroup = HL.mk("g", {}, svg);

    // Kinematics Springs
    const initialR = initialV != null ? initialV : 282;
    const spR = HL.spring(initialR, { k: 130, c: 14 });

    // Pre-create SVG elements for bonds and ions
    // Bonds: (3*3*2) * 3 = 54 bonds
    const bonds = [];
    for (let axis = 0; axis < 3; axis++) {
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          for (let c = -1; c <= 0; c++) {
            const line = HL.mk("line", { class: "sil", "stroke-width": 1.2, stroke: "var(--hl-edge)" }, bondGroup);
            bonds.push({ line, axis, a, b, c });
          }
        }
      }
    }

    // 27 Ion Spheres
    // Sort order for isometric rendering: back-to-front in projection
    // For Cam(az=45), depth increases with (-X + Y)
    const ions = [];
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const isNa = (ix + iy + iz) % 2 === 0;
          const radius = isNa ? 2.2 : 3.4; // Na+ is smaller, Cl- is larger
          const group = HL.mk("g", {}, ionGroup);
          const circle = HL.mk("path", { class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, group);
          const detail = HL.mk("circle", { r: isNa ? 0.8 : 1.2, class: isNa ? "dot" : "lo" }, group);
          ions.push({ group, circle, detail, ix, iy, iz, isNa, radius });
        }
      }
    }

    // Sort ions back-to-front
    ions.sort((a, b) => {
      const depthA = a.ix * Math.sin(Math.PI / 4) + a.iy * Math.cos(Math.PI / 4) + a.iz * 0.5;
      const depthB = b.ix * Math.sin(Math.PI / 4) + b.iy * Math.cos(Math.PI / 4) + b.iz * 0.5;
      return depthA - depthB;
    });

    function draw() {
      const r = spR.x; // pm (220 to 340)
      // Visual spacing: 282 pm maps to 10.5 units
      const d = (r / 282.0) * 10.5;
      const isEquil = Math.abs(r - 282) < 4.0;

      // Update Bonds
      bonds.forEach(b => {
        let p0, p1;
        if (b.axis === 0) {
          // X-axis
          p0 = P(b.c * d, b.a * d, centerZ + b.b * d);
          p1 = P((b.c + 1) * d, b.a * d, centerZ + b.b * d);
        } else if (b.axis === 1) {
          // Y-axis
          p0 = P(b.a * d, b.c * d, centerZ + b.b * d);
          p1 = P(b.a * d, (b.c + 1) * d, centerZ + b.b * d);
        } else {
          // Z-axis
          p0 = P(b.a * d, b.b * d, centerZ + b.c * d);
          p1 = P(b.a * d, b.b * d, centerZ + (b.c + 1) * d);
        }
        b.line.setAttribute("x1", HL.r2(p0[0]));
        b.line.setAttribute("y1", HL.r2(p0[1]));
        b.line.setAttribute("x2", HL.r2(p1[0]));
        b.line.setAttribute("y2", HL.r2(p1[1]));
        b.line.classList.toggle("hi", isEquil);
      });

      // Update Ions
      ions.forEach(ion => {
        const pt = P(ion.ix * d, ion.iy * d, centerZ + ion.iz * d);
        const rVisual = ion.radius;

        // Draw solid circle disc for sphere in projection
        const discPts = [];
        for (let a = 0; a < 20; a++) {
          const ang = (a * 2 * Math.PI) / 20;
          discPts.push([pt[0] + rVisual * Math.cos(ang), pt[1] + rVisual * Math.sin(ang)]);
        }
        ion.circle.setAttribute("d", HL.poly(discPts));

        // Center dot / equator detail
        ion.detail.setAttribute("cx", HL.r2(pt[0]));
        ion.detail.setAttribute("cy", HL.r2(pt[1]));

        ion.circle.classList.toggle("hi", isEquil);
      });

      // Header Readout
      const rStr = HL.r2(r);
      // Lattice energy approximation U(r)
      const uLattice = HL.r2(-786 * (282 / r));
      if (isEquil) {
        read.textContent = `Tinh thể NaCl: r = ${rStr} pm (Chuẩn r₀ = 282 pm) · U = ${uLattice} kJ/mol · [CÂN BẰNG BỀN] Lực hút Coulomb cân bằng lực đẩy Born (.hi)`;
      } else if (r < 282) {
        read.textContent = `Tinh thể NaCl: r = ${rStr} pm < 282 pm · Lực đẩy đám mây electron áp đảo (Mạng bị nén, thế năng tăng)`;
      } else {
        read.textContent = `Tinh thể NaCl: r = ${rStr} pm > 282 pm · Lực hút tĩnh điện Coulomb kéo về (Mạng bị giãn, thế năng tăng)`;
      }
    }

    function setDistance(val) {
      spR.t = HL.clamp(val, 220, 340);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setDistance(282.0); // Reset to equilibrium
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setDistance(220 + norm * 120.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spR, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setDistance(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
