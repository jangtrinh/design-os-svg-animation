export default {
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười",
  means: "Khung 10 ô đếm số: khay gỗ với 10 hốc lõm 2 hàng 5 cột. Ô trống vẽ nét đứt; đồng xu nhấc nảy có bóng đổ tiếp xúc đáy hốc.",
  rules: [1, 2, 4, 7, 10],
  range: [0, 7, 10],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 1.8);
    HL.fit(C, [[-55, -24, 0], [55, 24, 30]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    // Frame Tray (Wooden tray: z = 0 to 4.0)
    const [trayO, trayI] = HL.rings(-52, -22, 52, 22, 3, 1.5);
    const traySol = HL.solid(svg);
    HL.put(traySol, HL.prism(P, front, trayO, trayI, 0, 4.0));

    // 10 Recessed Cavities / Pockets (2 rows, 5 columns)
    // Cavity floor is at z = 1.6 (recessed 2.4 units into tray)
    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 10 : -10;
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;

        // Top opening of cavity at z = 4.0
        const [lipO] = HL.rings(cx - 8.5, cy - 8.5, cx + 8.5, cy + 8.5, 2.5, 0.5);
        HL.mk("path", {
          class: "lo",
          d: HL.poly(HL.ringAt(P, lipO, 4.0))
        }, svg);

        // Floor of cavity at z = 1.6
        const [floorO] = HL.rings(cx - 8.0, cy - 8.0, cx + 8.0, cy + 8.0, 2.0, 0.5);
        HL.mk("path", {
          class: "nf lo",
          d: HL.poly(HL.ringAt(P, floorO, 1.6))
        }, svg);

        // Subtle 3D recessed wall drop edge at far corner (top-left in camera view)
        const wallDrop = HL.seg(P(cx - 8.0, cy + 8.0, 4.0), P(cx - 8.0, cy + 8.0, 1.6));
        HL.mk("path", { class: "lo", d: wallDrop }, svg);
      }
    }

    // 10 Token Slots
    const tokens = [];
    const initCount = initialV != null ? Math.round(initialV) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;
        const cy = r === 0 ? 10 : -10;
        const active = slotIdx < initCount;

        // Dashed circle on cavity floor (shown only when cell is empty)
        const emptyPts = [];
        for (let k = 0; k <= 32; k++) {
          const a = (k / 32) * Math.PI * 2;
          emptyPts.push(P(cx + 5.5 * Math.cos(a), cy + 5.5 * Math.sin(a), 1.6));
        }
        const emptyEl = HL.mk("path", {
          class: "nf lo dash",
          d: HL.poly(emptyPts)
        }, svg);

        // Contact shadow element on cavity floor for lifted token
        const shadowEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Vertical drop line connecting lifted token to its contact shadow
        const dropLineEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Token solid
        const sol = HL.solid(svg);

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          lift: HL.spring(0, { k: 160, c: 15 }),
          sol,
          emptyEl,
          shadowEl,
          dropLineEl
        });

        slotIdx++;
      }
    }

    function draw() {
      tokens.forEach(tok => {
        if (tok.active) {
          tok.emptyEl.style.display = "none";

          const liftAmount = tok.lift.x;
          const z = 1.6 + liftAmount;

          // Token cylinder solid
          const [cO, cI] = HL.rings(tok.cx - 5.8, tok.cy - 5.8, tok.cx + 5.8, tok.cy + 5.8, 5.8, 0.7);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.5));

          // Contact shadow on the cavity floor at z = 1.6
          if (liftAmount > 0.4) {
            tok.shadowEl.style.display = "";
            const shadowPts = [];
            for (let k = 0; k <= 28; k++) {
              const a = (k / 28) * Math.PI * 2;
              shadowPts.push(P(tok.cx + 5.6 * Math.cos(a), tok.cy + 5.6 * Math.sin(a), 1.6));
            }
            tok.shadowEl.setAttribute("d", HL.poly(shadowPts));

            // Vertical drop guide from token bottom to contact shadow
            if (liftAmount > 2.0) {
              tok.dropLineEl.style.display = "";
              tok.dropLineEl.setAttribute("d", HL.seg(P(tok.cx, tok.cy, z), P(tok.cx, tok.cy, 1.6)));
            } else {
              tok.dropLineEl.style.display = "none";
            }
          } else {
            tok.shadowEl.style.display = "none";
            tok.dropLineEl.style.display = "none";
          }
        } else {
          // Empty slot: show gentle dashed circle on floor, NO extruded prism block
          tok.emptyEl.style.display = "";
          tok.shadowEl.style.display = "none";
          tok.dropLineEl.style.display = "none";
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const activeCount = tokens.filter(t => t.active).length;
      const topCount = tokens.filter((t, i) => i < 5 && t.active).length;
      const botCount = tokens.filter((t, i) => i >= 5 && t.active).length;
      const emptyCount = 10 - activeCount;

      read.textContent = `${activeCount} = ${topCount} (hàng trên) + ${botCount} (hàng dưới) · ${emptyCount} ô trống`;
    }

    function aim(pt) {
      if (!pt) {
        tokens.forEach(t => (t.lift.t = 0));
        reg.wake();
        return;
      }
      tokens.forEach(tok => {
        if (!tok.active) return;
        const scr = P(tok.cx, tok.cy, 5);
        const dist = Math.hypot(pt[0] - scr[0], pt[1] - scr[1]);
        tok.lift.t = dist < 22 ? 14 : 0;
      });
      reg.wake();
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      tokens.forEach(t => {
        if (HL.stepS(t.lift, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(
      HL.pointer(stage, {
        move: aim,
        leave: () => {
          tokens.forEach(t => (t.lift.t = 0));
          reg.wake();
        }
      })
    );
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        const count = Math.round(HL.clamp(v, 0, 10));
        tokens.forEach((t, i) => {
          t.active = i < count;
        });
        draw();
        reg.wake();
      },
      destroy: bag.dispose
    };
  }
};
