/*
 * 4. Olympic Track Hurdle (Rào Điền Kinh Bật Nhảy)
 * Physical Concept: Cơ chế rào vượt chướng ngại vật điền kinh:
 *   - 5 mức chiều cao tiêu chuẩn World Athletics (WA):
 *     76.2 cm (400m nữ), 83.8 cm (100m nữ), 91.4 cm (400m nam), 106.7 cm (110m nam).
 *   - Cơ chế đối trọng lật đổ an toàn: Lực xô ngang F ≥ 3.6 kg (≈ 36 N) ở mép trên
 *     sẽ làm rào lật đổ về phía trước giúp vận động viên không bị chấn thương.
 * Geometry: Đế chân chữ L kép bằng thép đặc, thanh giằng ngang, cặp trụ lồng ống điều chỉnh chiều cao,
 *   thanh xà ngang rào có các sọc tương phản trắng-đen tiêu chuẩn (100% opaque).
 * Kinematics: Di chuột điều chỉnh chiều cao rào từ 76cm đến 107cm; ống lồng trượt êm ái,
 *   thanh xà nâng cao mượt mà và nhún đàn hồi sống động theo HL.spring.
 */

export default {
  id: "pe-hurdle",
  title: "4. Rào Điền Kinh (Olympic Track Hurdle)",
  concept: "Quy chuẩn rào điền kinh WA: Chiều cao 76.2cm - 106.7cm · Cơ chế lật an toàn F ≥ 36 N",
  means: "Di chuột dọc nâng hạ chiều cao rào theo các cự ly thi đấu (100m nữ, 400m rào, 110m nam). Ống lồng cơ học nâng thanh xà rào lên chuẩn xác với dao động nhún đàn hồi.",
  rules: [1, 2, 4, 6, 9],
  range: [76.2, 91.4, 106.7],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-50, -22, 0], [50, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Running Track Platform (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -16, 45, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // 2. Dual L-shaped Feet (Chân đế chữ L kép)
    // Left foot at X = -18, Y from -10 to +8, Z = 2.5 to 4.5
    // Right foot at X = +18, Y from -10 to +8, Z = 2.5 to 4.5
    const footSolL = HL.solid(svg);
    const footSolR = HL.solid(svg);
    const [ftLO, ftLI] = HL.rings(-20, -10, -16, 8, 0.8, 0.3);
    const [ftRO, ftRI] = HL.rings(16, -10, 20, 8, 0.8, 0.3);
    HL.put(footSolL, HL.prism(P, front, ftLO, ftLI, 2.5, 4.5));
    HL.put(footSolR, HL.prism(P, front, ftRO, ftRI, 2.5, 4.5));

    // Cross brace connecting feet at Y = -6, Z = 3.0 to 4.5
    const braceSol = HL.solid(svg);
    const [brO, brI] = HL.rings(-16, -7.0, 16, -5.0, 0.5, 0.2);
    HL.put(braceSol, HL.prism(P, front, brO, brI, 2.8, 4.5));

    // 3. Fixed Outer Upright Columns at X = -18 and X = +18 (Y = 0, Z = 4.5 to 16.0)
    const postSolL = HL.solid(svg);
    const postSolR = HL.solid(svg);
    const [pLO, pLI] = HL.rings(-19.5, -1.5, -16.5, 1.5, 0.5, 0.2);
    const [pRO, pRI] = HL.rings(16.5, -1.5, 19.5, 1.5, 0.5, 0.2);
    HL.put(postSolL, HL.prism(P, front, pLO, pLI, 4.5, 15.5));
    HL.put(postSolR, HL.prism(P, front, pRO, pRI, 4.5, 15.5));

    // Adjustment locking knobs at Z = 14.5
    const knobL = HL.mk("circle", { cx: HL.r2(P(-20.5, 0, 14.5)[0]), cy: HL.r2(P(-20.5, 0, 14.5)[1]), r: 1.5, class: "dot" }, svg);
    const knobR = HL.mk("circle", { cx: HL.r2(P(20.5, 0, 14.5)[0]), cy: HL.r2(P(20.5, 0, 14.5)[1]), r: 1.5, class: "dot" }, svg);

    // 4. Moving Telescopic Inner Assembly & Top Hurdle Board
    const hurdleGroup = HL.mk("g", {}, svg);
    const innerTubesSol = HL.solid(hurdleGroup);
    const boardGroup = HL.mk("g", {}, hurdleGroup);
    const boardSol = HL.solid(boardGroup);

    // Contrasting zebra stripes on the hurdle board
    const stripesGroup = HL.mk("g", {}, boardGroup);
    const stripePaths = [];
    for (let s = 0; s < 4; s++) {
      const sp = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, stripesGroup);
      stripePaths.push(sp);
    }

    // Kinematics Springs
    const initialH = initialV != null ? initialV : 91.4;
    const spH = HL.spring(initialH, { k: 120, c: 14 });

    function draw() {
      const hCm = spH.x; // 76.2 to 106.7 cm
      // Map hCm to 3D Z coordinate: 76.2cm -> Z = 18.0, 106.7cm -> Z = 28.0
      const curZ = 18.0 + ((hCm - 76.2) / (106.7 - 76.2)) * 10.0;
      const boardH = 3.6; // Board height in Z
      const boardW = 0.8; // Board thickness in Y

      // A. Inner Telescopic Tubes (Z: 14.0 to curZ)
      const [inLO, inLI] = HL.rings(-19.0, -1.0, -17.0, 1.0, 0.4, 0.2);
      const [inRO, inRI] = HL.rings(17.0, -1.0, 19.0, 1.0, 0.4, 0.2);
      let inSil = "";
      const pL_b = HL.prism(P, front, inLO, inLI, 14.0, curZ);
      const pR_b = HL.prism(P, front, inRO, inRI, 14.0, curZ);
      HL.put(innerTubesSol, { sil: pL_b.sil + " " + pR_b.sil, crease: "" });

      // B. Top Hurdle Board (X: -22 to +22, Y = 0, Z: curZ to curZ + boardH)
      const b00 = P(-22, -boardW, curZ);
      const b10 = P(22, -boardW, curZ);
      const b11 = P(22, boardW, curZ);
      const b01 = P(-22, boardW, curZ);

      const b00T = P(-22, -boardW, curZ + boardH);
      const b10T = P(22, -boardW, curZ + boardH);
      const b11T = P(22, boardW, curZ + boardH);
      const b01T = P(-22, boardW, curZ + boardH);

      let bSil = "";
      // Front face (+Y)
      bSil += HL.poly([b01, b11, b11T, b01T]);
      // Right face (+X)
      bSil += HL.poly([b11, b10, b10T, b11T]);
      // Top face (+Z)
      bSil += HL.poly([b00T, b10T, b11T, b01T]);

      HL.put(boardSol, { sil: bSil, crease: "" });

      // Contrasting stripes on the front face (at X = -14..-8 and X = 8..14)
      const stripeSlots = [
        [-14, -8],
        [8, 14]
      ];
      stripeSlots.forEach((slot, idx) => {
        const s0 = P(slot[0], boardW + 0.1, curZ);
        const s1 = P(slot[1], boardW + 0.1, curZ);
        const s1T = P(slot[1], boardW + 0.1, curZ + boardH);
        const s0T = P(slot[0], boardW + 0.1, curZ + boardH);
        stripePaths[idx].setAttribute("d", HL.poly([s0, s1, s1T, s0T]));
        stripePaths[idx].classList.toggle("hi", true);
      });

      // Highlight effect
      const isOlympicHigh = hCm >= 105.0;
      boardSol.sil.classList.toggle("hi", isOlympicHigh);

      // Header Readout
      const hStr = HL.r2(hCm);
      let desc = "";
      if (hCm <= 78) desc = "400m Rào Nữ (76.2 cm)";
      else if (hCm <= 86) desc = "100m Rào Nữ (83.8 cm)";
      else if (hCm <= 95) desc = "400m Rào Nam (91.4 cm)";
      else desc = "110m Rào Nam Tiêu Chuẩn Olympic (106.7 cm)";

      read.textContent = `Rào điền kinh: h = ${hStr} cm · Chuẩn: [${desc}] · Lực lật an toàn WA: F ≥ 36 N (.hi)`;
    }

    function setHurdle(val) {
      spH.t = HL.clamp(val, 76.2, 106.7);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setHurdle(91.4);
        return;
      }
      const minY = 30, maxY = 130;
      const norm = HL.clamp(1.0 - (pt[1] - minY) / (maxY - minY), 0, 1);
      setHurdle(76.2 + norm * (106.7 - 76.2));
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spH, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setHurdle(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
