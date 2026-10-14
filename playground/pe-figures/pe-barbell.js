/*
 * 2. Olympic Barbell & Weight Plates (Đòn Tạ & Đĩa Tạ Thể Hình)
 * Physical Concept: Trọng tải cơ học P = M·g · Công nâng tạ W = P·h · Độ võng uốn đàn hồi thanh đòn thép.
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
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.05);
    HL.fit(C, [[-48, -16, 0], [48, 16, 26]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Weightlifting Platform Base (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-48, -16, 48, 16, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    HL.mk("path", {
      d: HL.seg(P(-36, -12, 2.6), P(36, -12, 2.6)) + HL.seg(P(-36, 12, 2.6), P(36, 12, 2.6)),
      class: "nf lo"
    }, svg);

    // 2. Back-left Squat Rack Upright (X = -19) & J-Cup Hook
    const rackZ0 = 2.5, rackZ1 = 23.5;
    const rackSolL = HL.solid(svg);
    const [rLkO, rLkI] = HL.rings(-20.8, -4.5, -17.2, 0.5, 0.5, 0.2);
    HL.put(rackSolL, HL.prism(P, front, rLkO, rLkI, rackZ0, rackZ1));

    const hookSolL = HL.solid(svg);
    const [hLO, hLI] = HL.rings(-21.2, 0.5, -16.8, 5.2, 0.4, 0.2);
    HL.put(hookSolL, HL.prism(P, front, hLO, hLI, 14.8, 17.2));

    // 3. Painter's Order: Back-Left Plates (-38, -33, -28), Shaft, Front-Right Rack, Front-Right Plates (+28, +33, +38)
    const barRestZ = 17.4, barY = 3.2;
    const plateSlots = [
      { lx: -27.5, rx: 27.5, r: 9.2 },
      { lx: -32.5, rx: 32.5, r: 7.8 },
      { lx: -37.0, rx: 37.0, r: 6.4 }
    ];

    const collarL = HL.mk("circle", { r: 2.2, class: "dot m" }, svg);
    // Append left plates back-to-front: idx 2 (-37), idx 1 (-32.5), idx 0 (-27.5)
    const solL2 = HL.solid(svg), solL1 = HL.solid(svg), solL0 = HL.solid(svg);
    const leftSols = [solL0, solL1, solL2];

    // Barbell 3D sleeve/shaft & grip knurling
    const barSleeveL = HL.mk("path", { class: "nf sil" }, svg);
    const barLine = HL.mk("path", { class: "nf sil" }, svg);
    const knurlPath = HL.mk("path", { class: "nf hi" }, svg);

    // Front-Right Squat Rack Upright (X = +19) & J-Cup Hook
    const rackSolR = HL.solid(svg);
    const [rRkO, rRkI] = HL.rings(17.2, -4.5, 20.8, 0.5, 0.5, 0.2);
    HL.put(rackSolR, HL.prism(P, front, rRkO, rRkI, rackZ0, rackZ1));

    const hookSolR = HL.solid(svg);
    const [hRO, hRI] = HL.rings(16.8, 0.5, 21.2, 5.2, 0.4, 0.2);
    HL.put(hookSolR, HL.prism(P, front, hRO, hRI, 14.8, 17.2));

    // Append right plates back-to-front: idx 0 (+27.5), idx 1 (+32.5), idx 2 (+37.0)
    const solR0 = HL.solid(svg), solR1 = HL.solid(svg), solR2 = HL.solid(svg);
    const rightSols = [solR0, solR1, solR2];
    const barSleeveR = HL.mk("path", { class: "nf sil" }, svg);
    const collarR = HL.mk("circle", { r: 2.2, class: "dot" }, svg);

    function buildPlatePaths(xCenter, zCenter, pR) {
      const hR = 2.4, halfT = 1.85, N = 24;
      const back = [], frontFace = [], innerRim = [], hub = [];
      for (let i = 0; i < N; i++) {
        const a = (i * 2 * Math.PI) / N;
        const dy = Math.cos(a), dz = Math.sin(a);
        back.push(P(xCenter - halfT, barY + pR * dy, zCenter + pR * dz));
        frontFace.push(P(xCenter + halfT, barY + pR * dy, zCenter + pR * dz));
        innerRim.push(P(xCenter + halfT, barY + (pR - 1.4) * dy, zCenter + (pR - 1.4) * dz));
        hub.push(P(xCenter + halfT, barY + hR * dy, zCenter + hR * dz));
      }
      return {
        sil: HL.poly(HL.hull(back.concat(frontFace))),
        crease: HL.poly(frontFace) + HL.poly(innerRim) + HL.poly(hub)
      };
    }

    const initialW = initialV != null ? initialV : 60;
    const spWeight = HL.spring(initialW, { k: 110, c: 13 });
    let lastKey = "";

    function draw() {
      const w = spWeight.x;
      const key = `${HL.r2(w)}`;
      if (key === lastKey) return;
      lastKey = key;

      const sag = ((w - 20) / 120.0) * 2.2;
      const zEnds = barRestZ;
      const zMid = barRestZ - sag;

      const pL = P(-25, barY, zEnds), pMid = P(0, barY, zMid), pR = P(25, barY, zEnds);
      barLine.setAttribute("d", `M${HL.r2(pL[0])} ${HL.r2(pL[1])}Q${HL.r2(pMid[0])} ${HL.r2(pMid[1])} ${HL.r2(pR[0])} ${HL.r2(pR[1])}`);
      barSleeveL.setAttribute("d", HL.seg(P(-42, barY, zEnds), pL));
      barSleeveR.setAttribute("d", HL.seg(P(38, barY, zEnds), P(43, barY, zEnds)));

      const kL0 = P(-14, barY, barRestZ - sag * 0.5), kL1 = P(-5, barY, barRestZ - sag * 0.85);
      const kR0 = P(5, barY, barRestZ - sag * 0.85), kR1 = P(14, barY, barRestZ - sag * 0.5);
      knurlPath.setAttribute("d", HL.seg(kL0, kL1) + HL.seg(kR0, kR1));

      const activePairs = w <= 25 ? 1 : w <= 75 ? 2 : 3;

      plateSlots.forEach((slot, idx) => {
        const sL = leftSols[idx], sR = rightSols[idx];
        if (idx < activePairs) {
          HL.put(sL, buildPlatePaths(slot.lx, zEnds, slot.r));
          HL.put(sR, buildPlatePaths(slot.rx, zEnds, slot.r));
          const isOuter = idx === activePairs - 1;
          sL.sil.classList.toggle("hi", isOuter);
          sR.sil.classList.toggle("hi", isOuter);
        } else {
          HL.put(sL, { sil: "", crease: "" });
          HL.put(sR, { sil: "", crease: "" });
          sL.sil.classList.remove("hi");
          sR.sil.classList.remove("hi");
        }
      });

      HL.place(collarL, P(-42, barY, zEnds));
      HL.place(collarR, P(43, barY, zEnds));

      const totalW = Math.round(w);
      const pN = Math.round(totalW * 9.8);
      const workJ = Math.round(pN * 0.75);
      read.textContent = `M=${totalW}kg · P=${pN}N · W=${workJ}J`;
    }

    function setWeight(val) {
      spWeight.t = HL.clamp(val, 20, 140);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setWeight(60); return; }
      const [wx] = HL.unproj(C, pt[0], pt[1], barRestZ);
      const norm = HL.clamp((wx + 38) / 76, 0, 1);
      setWeight(20 + norm * 120.0);
    }

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
      set(v) { setWeight(Number(v)); },
      destroy: bag.dispose
    };
  }
};
