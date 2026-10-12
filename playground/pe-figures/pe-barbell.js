/*
 * 2. Olympic Barbell & Weight Plates (Đòn Tạ & Đĩa Tạ Thể Hình)
 * Physical Concept: Trọng tải cơ học & Công thực hiện khi nâng tạ:
 *   - Thanh đòn tiêu chuẩn Olympic nam: Khối lượng m₀ = 20 kg.
 *   - Thêm các cặp đĩa tạ 20 kg ở hai đầu đòn: Tổng tải M từ 20 kg đến 140 kg.
 *   - Trọng lực đè nén: P = M · g (g ≈ 9.8 m/s²).
 *   - Công cơ học nâng tạ hoàn thành 1 lần Squat (h = 0.75 m): W = P · h.
 *   - Độ võng uốn đàn hồi của thép Olympic: δ ~ M · L³ / (48·E·I).
 * Geometry: Sàn nâng tạ thể thao đặc, cặp trụ giá đỡ Squat rack chữ U vững chãi,
 *   thanh đòn thép có khía vân tay nắm (knurl), các đĩa tạ cao su tròn đặc (100% opaque) và kẹp khóa tạ.
 * Kinematics: Di chuột điều chỉnh mức tạ từ 20 kg đến 140 kg; các đĩa tạ tự động xếp chồng vào ngàm,
 *   thanh đòn uốn võng và nhún đàn hồi sống động theo HL.spring.
 */

export default {
  id: "pe-barbell",
  title: "2. Đòn Tạ Olympic (Barbell & Weight Plates)",
  concept: "Tải trọng cơ học: P = M·g · Công nâng tạ W = P·h · Độ võng uốn đàn hồi của thanh đòn thép",
  means: "Di chuột tăng giảm mức tạ từ 20kg đến 140kg. Các cặp đĩa tạ xếp chồng vào hai đầu đòn; thanh đòn thép uốn cong nhẹ và nhún đàn hồi chân thực theo tải trọng tác dụng.",
  rules: [1, 2, 4, 6, 9],
  range: [20, 60, 140],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.85);
    HL.fit(C, [[-52, -22, 0], [52, 22, 38]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Weightlifting Platform Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    // Platform boundary guide lines
    HL.mk("line", {
      x1: HL.r2(P(-36, -12, 2.6)[0]), y1: HL.r2(P(-36, -12, 2.6)[1]),
      x2: HL.r2(P(36, -12, 2.6)[0]), y2: HL.r2(P(36, -12, 2.6)[1]),
      class: "lo", "stroke-width": 0.8
    }, svg);

    // 2. Dual Squat Rack Uprights at X = -20 and X = +20
    const rackZ0 = 2.5, rackZ1 = 22.0;
    const rackSolL = HL.solid(svg);
    const rackSolR = HL.solid(svg);
    const [rLkO, rLkI] = HL.rings(-22, -3.0, -18, 3.0, 0.6, 0.2);
    const [rRkO, rRkI] = HL.rings(18, -3.0, 22, 3.0, 0.6, 0.2);
    HL.put(rackSolL, HL.prism(P, front, rLkO, rLkI, rackZ0, rackZ1));
    HL.put(rackSolR, HL.prism(P, front, rRkO, rRkI, rackZ0, rackZ1));

    // J-cup hooks at Z = 16.0
    const hookSolL = HL.solid(svg);
    const hookSolR = HL.solid(svg);
    const [hLO, hLI] = HL.rings(-22.5, 2.5, -17.5, 5.5, 0.4, 0.2);
    const [hRO, hRI] = HL.rings(17.5, 2.5, 22.5, 5.5, 0.4, 0.2);
    HL.put(hookSolL, HL.prism(P, front, hLO, hLI, 15.0, 17.5));
    HL.put(hookSolR, HL.prism(P, front, hRO, hRI, 15.0, 17.5));

    // 3. Barbell Bar & Weight Plates
    // Bar sits at Y = 4.0, rest Z = 17.2, length from X = -42 to +42
    const barRestZ = 17.2;
    const barGroup = HL.mk("g", {}, svg);
    const barLine = HL.mk("path", { class: "sil", "stroke-width": 2.6, stroke: "var(--hl-edge)", fill: "none" }, barGroup);

    // Knurling markers along the bar (grip sections)
    const knurlL = HL.mk("line", { class: "lo", "stroke-width": 2.2 }, barGroup);
    const knurlR = HL.mk("line", { class: "lo", "stroke-width": 2.2 }, barGroup);

    // Plate slots: 3 pairs of 20kg plates (up to 140kg total)
    // Left plate positions: X = -28, -31.5, -35
    // Right plate positions: X = +28, +31.5, +35
    const plateSlots = [
      { lx: -28, rx: 28, kg: 20 },
      { lx: -31.5, rx: 31.5, kg: 20 },
      { lx: -35, rx: 35, kg: 20 }
    ];

    const plates = plateSlots.map(slot => {
      const gL = HL.mk("g", {}, barGroup);
      const gR = HL.mk("g", {}, barGroup);
      const solL = HL.solid(gL);
      const solR = HL.solid(gR);
      return { slot, gL, gR, solL, solR };
    });

    // Outer Collar locks at X = -38 and X = +38
    const collarGroup = HL.mk("g", {}, barGroup);
    const collarL = HL.mk("circle", { r: 2.2, class: "dot" }, collarGroup);
    const collarR = HL.mk("circle", { r: 2.2, class: "dot" }, collarGroup);

    // Kinematics Springs
    const initialW = initialV != null ? initialV : 60;
    const spWeight = HL.spring(initialW, { k: 110, c: 13 });

    function draw() {
      const w = spWeight.x; // 20 to 140 kg
      // Elastic sag at center: up to 1.8mm at 140kg
      const sag = ((w - 20) / 120.0) * 1.8;
      const barY = 4.0;
      const zEnds = barRestZ;
      const zMid = barRestZ - sag;

      // Draw flexing curved bar line
      const pL = P(-42, barY, zEnds);
      const pMid = P(0, barY, zMid);
      const pR = P(42, barY, zEnds);
      barLine.setAttribute("d", `M ${HL.r2(pL[0])} ${HL.r2(pL[1])} Q ${HL.r2(pMid[0])} ${HL.r2(pMid[1])} ${HL.r2(pR[0])} ${HL.r2(pR[1])}`);

      // Knurl markers
      const kL0 = P(-14, barY, barRestZ - sag * 0.5);
      const kL1 = P(-6, barY, barRestZ - sag * 0.8);
      knurlL.setAttribute("x1", HL.r2(kL0[0])); knurlL.setAttribute("y1", HL.r2(kL0[1]));
      knurlL.setAttribute("x2", HL.r2(kL1[0])); knurlL.setAttribute("y2", HL.r2(kL1[1]));

      const kR0 = P(6, barY, barRestZ - sag * 0.8);
      const kR1 = P(14, barY, barRestZ - sag * 0.5);
      knurlR.setAttribute("x1", HL.r2(kR0[0])); knurlR.setAttribute("y1", HL.r2(kR0[1]));
      knurlR.setAttribute("x2", HL.r2(kR1[0])); knurlR.setAttribute("y2", HL.r2(kR1[1]));

      // Active number of plate pairs:
      // w = 20kg -> 0 pairs
      // w <= 60kg -> 1 pair
      // w <= 100kg -> 2 pairs
      // w > 100kg -> 3 pairs
      const activePairs = w <= 25 ? 0 : w <= 65 ? 1 : w <= 105 ? 2 : 3;

      plates.forEach((p, idx) => {
        if (idx < activePairs) {
          p.gL.style.display = "";
          p.gR.style.display = "";

          // Bumper plate: Solid circular disk of radius 7.5 on Y-Z plane
          // In 2:1 axonometric projection, a circle on YZ plane is drawn with points:
          // X = const, Y = R cos(a), Z = R sin(a)
          const pR = 7.5;
          const leftPts = [];
          const rightPts = [];
          for (let a = 0; a < 24; a++) {
            const ang = (a * 2 * Math.PI) / 24;
            leftPts.push(P(p.slot.lx, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
            rightPts.push(P(p.slot.rx, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
          }

          // Thickness of plate in X: 2.2
          const leftThickPts = [];
          const rightThickPts = [];
          for (let a = 0; a < 24; a++) {
            const ang = (a * 2 * Math.PI) / 24;
            leftThickPts.push(P(p.slot.lx - 2.0, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
            rightThickPts.push(P(p.slot.rx + 2.0, barY + pR * Math.cos(ang), zEnds + pR * Math.sin(ang)));
          }

          let silL = HL.poly(leftPts);
          let silR = HL.poly(rightPts);
          HL.put(p.solL, { sil: silL, crease: "" });
          HL.put(p.solR, { sil: silR, crease: "" });

          p.solL.sil.classList.toggle("hi", w >= 100);
          p.solR.sil.classList.toggle("hi", w >= 100);
        } else {
          p.gL.style.display = "none";
          p.gR.style.display = "none";
        }
      });

      // Collars
      const colL = P(-38, barY, zEnds);
      const colR = P(38, barY, zEnds);
      collarL.setAttribute("cx", HL.r2(colL[0])); collarL.setAttribute("cy", HL.r2(colL[1]));
      collarR.setAttribute("cx", HL.r2(colR[0])); collarR.setAttribute("cy", HL.r2(colR[1]));

      // Header Readout
      const totalW = Math.round(w);
      const pN = Math.round(totalW * 9.8);
      const workJ = Math.round(pN * 0.75); // Squat lift 0.75m
      if (totalW >= 100) {
        read.textContent = `Đòn tạ: M = ${totalW} kg (${activePairs} cặp đĩa 20kg) · Trọng tải P = ${pN} N · Công nâng Squat (0.75m): W = ${workJ} J (.hi)`;
      } else {
        read.textContent = `Đòn tạ: M = ${totalW} kg (${activePairs} cặp đĩa) · Trọng tải P = ${pN} N · Công thực hiện W = ${workJ} J`;
      }
    }

    function setWeight(val) {
      spWeight.t = HL.clamp(val, 20, 140);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setWeight(60);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxScrX - minScrX), 0, 1);
      setWeight(20 + norm * 120.0);
    }
    const maxScrX = 340, minScrX = 60;

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spWeight, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setWeight(Number(v));
      },
      destroy: bag.dispose
    };
  }
};
