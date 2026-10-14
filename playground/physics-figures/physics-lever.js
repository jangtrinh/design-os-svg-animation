export default {
  id: "physics-lever",
  title: "1. Đòn Bẩy & Điểm Tựa (Lever & Fulcrum)",
  concept: "Quy tắc đòn bẩy: F₁ · d₁ = F₂ · d₂ (Cân bằng mô-men lực)",
  means:
    "Di chuột ngang để dịch điểm tựa nêm: thanh đòn nghiêng theo độ lệch mô-men. "
    + "Khi d₂ = 2d₁ (tải trái nặng gấp đôi tải phải), thanh đòn nằm ngang, "
    + "hai mô-men bằng nhau và chính thanh đòn sáng lên báo cân bằng.",
  rules: [1, 2, 4, 6, 9],
  range: [-20, -8, 15],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const k = globalThis.AK;
    const L = globalThis.LEVER;
    svg.setAttribute("class", "iso iso-svg");
    svg.setAttribute("data-theme", "light");
    const view = L.frame(k);
    const C = HL.cam(45, 0.5, view.S); // the drawing's camera: pointer and picture share one projection
    HL.fit(C, view.pts, 200, 160);
    const root = HL.mk("g", {}, svg);
    const sp = HL.spring(initialV != null ? initialV : L.restFulcrum, { k: 140, c: 15 });
    let last = "";
    const paint = () => {
      const posed = L.model(sp.x);
      read.textContent = L.readout(posed);
      const accent = posed.balanced ? "beam" : "wedge"; // lit: the beam at balance, else the wedge
      const key = `${HL.r2(sp.x)}:${accent}`;
      if (key === last) return;
      last = key;
      root.innerHTML = L.markup(k, view.P, { xf: sp.x, theta: posed.theta, accent });
    };
    const aim = (target) => {
      sp.t = HL.clamp(Number(target), -20, 15);
      reg.wake();
    };
    // Pointer column -> fulcrum on the rail (y = 0, deck height); the screen's vertical axis is ignored.
    const onRail = (sx) => {
      const a = HL.unproj(C, sx, 0, L.deckZ), b = HL.unproj(C, sx, 1, L.deckZ);
      return a[0] + ((b[0] - a[0]) * -a[1]) / (b[1] - a[1]);
    };
    const point = (pt) => aim(pt ? onRail(pt[0]) : L.restFulcrum);
    const reg = HL.register(stage, (dt) => {
      const moving = HL.stepS(sp, dt);
      paint();
      return moving;
    });
    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: point, down: point, leave: () => point(null) }));
    bag.add(() => svg.replaceChildren());
    paint();
    return { set: aim, destroy: bag.dispose };
  }
};
