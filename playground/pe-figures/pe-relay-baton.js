/*
 * 3. 4x100m Relay Baton & Exchange Zone (Gậy Tiếp Sức & Làn Chạy Điền Kinh)
 * Physical Concept: Vùng trao gậy 30m chuẩn World Athletics (WA Rule 24.19) từ -15m đến +15m.
 */

export default {
  id: "pe-relay-baton",
  title: "3. Gậy Tiếp Sức (Relay Baton & Track)",
  concept: "Điền kinh 4x100m: Vùng trao gậy 30m chuẩn World Athletics Rule 24.19 · Hợp lệ vs DQ",
  means: "Di chuột di chuyển vị trí trao gậy dọc đường chạy (-25m đến +25m). Trạng thái [HỢP LỆ] kích hoạt khi gậy nằm trọn vẹn trong vùng 30m, cảnh báo [DQ] khi rơi ra ngoài.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, 0, 20],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    HL.cam = HL.Cam;
    const C = HL.cam(45, 0.5, 3.35);
    HL.fit(C, [[-45, -20, 0], [45, 20, 24]], 200, 165);
    const P = HL.proj(C), front = HL.facing(C);

    // 1. Running Track Platform (Z: 0 to 2.5)
    const [baseO, baseI] = HL.rings(-45, -20, 45, 20, 2.5, 0.8);
    const baseSol = HL.solid(svg);
    HL.put(baseSol, HL.prism(P, front, baseO, baseI, 0, 2.5));

    const laneY1 = -9.0, laneY2 = 9.0;
    HL.mk("path", {
      d: HL.seg(P(-44.5, laneY1, 2.6), P(44.5, laneY1, 2.6)) + HL.seg(P(-44.5, laneY2, 2.6), P(44.5, laneY2, 2.6)),
      class: "nf lo"
    }, svg);
    HL.mk("path", {
      d: HL.seg(P(-44, 0, 2.6), P(44, 0, 2.6)),
      class: "nf dash"
    }, svg);

    // 2. Takeover Zone Markings (X = -15 to +15, 30m zone per WA Rule 24.19)
    const zoneEntryX = -15.0, zoneExitX = 15.0;
    const entryLine = HL.mk("line", {
      x1: HL.r2(P(zoneEntryX, laneY1, 2.6)[0]), y1: HL.r2(P(zoneEntryX, laneY1, 2.6)[1]),
      x2: HL.r2(P(zoneEntryX, laneY2, 2.6)[0]), y2: HL.r2(P(zoneEntryX, laneY2, 2.6)[1]),
      class: "sil"
    }, svg);
    const exitLine = HL.mk("line", {
      x1: HL.r2(P(zoneExitX, laneY1, 2.6)[0]), y1: HL.r2(P(zoneExitX, laneY1, 2.6)[1]),
      x2: HL.r2(P(zoneExitX, laneY2, 2.6)[0]), y2: HL.r2(P(zoneExitX, laneY2, 2.6)[1]),
      class: "sil"
    }, svg);

    const chevronMark = HL.mk("path", {
      d: HL.open([P(-3.5, -2.5, 2.6), P(0, 0, 2.6), P(-3.5, 2.5, 2.6)]),
      class: "nf lo"
    }, svg);

    // 3. Ground Shadow, Motion Arc & 3D Cylindrical Relay Baton
    const shadowLine = HL.mk("line", { class: "lo" }, svg);
    const arcArrow = HL.mk("path", { class: "nf dash" }, svg);

    const batonGroup = HL.mk("g", {}, svg);
    const batonBody = HL.mk("polygon", { class: "sil" }, batonGroup);
    const batonBand = HL.mk("polygon", { class: "lo" }, batonGroup);
    const batonCapBot = HL.mk("path", { class: "lo" }, batonGroup);
    const batonCapTop = HL.mk("path", { class: "hi" }, batonGroup);

    const initialPos = initialV != null ? initialV : 0;
    const spPos = HL.spring(initialPos, { k: 130, c: 14 });
    let lastKey = "";

    function draw() {
      const x = spPos.x;
      const key = `${HL.r2(x)}`;
      if (key === lastKey) return;
      lastKey = key;

      const isInZone = x >= zoneEntryX && x <= zoneExitX;
      const bLen = 28.0, bRad = 3.2;
      const bAng = (28 * Math.PI) / 180;
      const cosB = Math.cos(bAng), sinB = Math.sin(bAng);
      const bCenter = [x, 0.0, 12.5];

      const e0 = [bCenter[0] - (bLen / 2) * cosB, 0, bCenter[2] - (bLen / 2) * sinB];
      const e1 = [bCenter[0] + (bLen / 2) * cosB, 0, bCenter[2] + (bLen / 2) * sinB];

      const capBotPts = [], capTopPts = [], bandPts0 = [], bandPts1 = [];
      const b0 = [bCenter[0] - 3.5 * cosB, 0, bCenter[2] - 3.5 * sinB];
      const b1 = [bCenter[0] + 3.5 * cosB, 0, bCenter[2] + 3.5 * sinB];
      const N = 20;
      for (let i = 0; i < N; i++) {
        const phi = (i / N) * Math.PI * 2;
        const cp = Math.cos(phi), sp = Math.sin(phi);
        const dx = bRad * sp * (-sinB), dy = bRad * cp, dz = bRad * sp * cosB;
        capBotPts.push(P(e0[0] + dx, dy, e0[2] + dz));
        capTopPts.push(P(e1[0] + dx, dy, e1[2] + dz));
        bandPts0.push(P(b0[0] + dx * 1.04, dy * 1.04, b0[2] + dz * 1.04));
        bandPts1.push(P(b1[0] + dx * 1.04, dy * 1.04, b1[2] + dz * 1.04));
      }

      batonCapBot.setAttribute("d", HL.poly(capBotPts));
      batonCapTop.setAttribute("d", HL.poly(capTopPts));

      const bodyHull = HL.hull(capBotPts.concat(capTopPts));
      batonBody.setAttribute("points", bodyHull.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const bandHull = HL.hull(bandPts0.concat(bandPts1));
      batonBand.setAttribute("points", bandHull.map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "));

      const s0 = P(e0[0], 0, 2.6), s1 = P(e1[0], 0, 2.6);
      shadowLine.setAttribute("x1", HL.r2(s0[0])); shadowLine.setAttribute("y1", HL.r2(s0[1]));
      shadowLine.setAttribute("x2", HL.r2(s1[0])); shadowLine.setAttribute("y2", HL.r2(s1[1]));

      const arcPts = [];
      for (let k = -8; k <= 8; k += 2) {
        arcPts.push(P(x + k, 0, 18.5 - (k * k) * 0.04));
      }
      arcArrow.setAttribute("d", HL.open(arcPts));

      batonCapTop.classList.toggle("hi", true);
      batonBody.classList.toggle("hi", isInZone);
      entryLine.classList.toggle("hi", isInZone);
      exitLine.classList.toggle("hi", isInZone);
      chevronMark.classList.toggle("hi", isInZone);

      const tag = isInZone ? "VALID" : x < zoneEntryX ? "EARLY" : "DQ";
      read.textContent = `x=${HL.r2(x)}m · ${tag} (30m)`;
    }

    function setPos(val) {
      spPos.t = HL.clamp(val, -22, 22);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) { setPos(0); return; }
      const [wx] = HL.unproj(C, pt[0], pt[1], 12.5);
      setPos(wx);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spPos, dt);
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());
    draw();

    return {
      set(v) { setPos(Number(v)); },
      destroy: bag.dispose
    };
  }
};
