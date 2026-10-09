export default {
  id: "math-ten-frame",
  title: "3. Khung 10 Ô (Ten Frame Counter)",
  concept: "Cấu trúc số 10 cơ số mười & Bổ số 10",
  means: "Khung 10 ô đếm số: khay gỗ 2 hàng 5 cột. Click vào ô để đặt hoặc bốc đồng xu; hiệu ứng thả rơi nảy chạm đáy hốc, hiển thị phép cộng bổ số 10 (vd: 7 + 3 = 10).",
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

        // Subtle 3D recessed wall drop edge at far corner
        const wallDrop = HL.seg(P(cx - 8.0, cy + 8.0, 4.0), P(cx - 8.0, cy + 8.0, 1.6));
        HL.mk("path", { class: "lo", d: wallDrop }, svg);
      }
    }

    // 10 Token Slots
    const tokens = [];
    let count = initialV != null ? Math.round(initialV) : 7;
    let slotIdx = 0;

    for (let r = 0; r < 2; r++) {
      const cy = r === 0 ? 10 : -10;
      for (let c = 0; c < 5; c++) {
        const cx = -40 + c * 20;
        const active = slotIdx < count;

        // Dashed circle on cavity floor (shown when empty)
        const emptyPts = [];
        for (let k = 0; k <= 32; k++) {
          const a = (k / 32) * Math.PI * 2;
          emptyPts.push(P(cx + 5.5 * Math.cos(a), cy + 5.5 * Math.sin(a), 1.6));
        }
        const emptyEl = HL.mk("path", {
          class: "nf lo dash",
          d: HL.poly(emptyPts)
        }, svg);

        // Contact shadow element on cavity floor for dropping/lifted token
        const shadowEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Drop line connecting token to floor during drop
        const dropLineEl = HL.mk("path", {
          class: "nf lo dash",
          d: ""
        }, svg);

        // Token solid
        const sol = HL.solid(svg);

        // Token spring: drop elevation in Z (starts at 0 if active, 16 if inactive)
        const dropSp = HL.spring(0, { k: 220, c: 16 });

        tokens.push({
          idx: slotIdx,
          cx,
          cy,
          active,
          dropSp,
          sol,
          emptyEl,
          shadowEl,
          dropLineEl
        });

        slotIdx++;
      }
    }

    function applyCount(newCount) {
      count = HL.clamp(newCount, 0, 10);
      tokens.forEach((tok, i) => {
        const wasActive = tok.active;
        const willBeActive = i < count;
        tok.active = willBeActive;
        if (willBeActive && !wasActive) {
          // Trigger drop animation from above
          tok.dropSp.x = 14;
          tok.dropSp.t = 0;
        } else if (!willBeActive && wasActive) {
          // Lift up and vanish
          tok.dropSp.t = 16;
        } else if (willBeActive) {
          tok.dropSp.t = 0;
        }
      });
      reg.wake();
    }

    function draw() {
      tokens.forEach(tok => {
        const dropZ = tok.dropSp.x;

        if (tok.active || dropZ < 15.5) {
          tok.emptyEl.style.display = "none";

          const z = 1.6 + Math.max(0, dropZ);

          // Token cylinder solid
          const [cO, cI] = HL.rings(tok.cx - 5.8, tok.cy - 5.8, tok.cx + 5.8, tok.cy + 5.8, 5.8, 0.7);
          HL.put(tok.sol, HL.prism(P, front, cO, cI, z, z + 2.5));

          // Contact shadow on the cavity floor at z = 1.6
          if (dropZ > 0.4) {
            tok.shadowEl.style.display = "";
            const shadowPts = [];
            const shadowScale = HL.clamp(1 - dropZ * 0.03, 0.5, 1);
            for (let k = 0; k <= 24; k++) {
              const a = (k / 24) * Math.PI * 2;
              shadowPts.push(P(tok.cx + 5.6 * shadowScale * Math.cos(a), tok.cy + 5.6 * shadowScale * Math.sin(a), 1.6));
            }
            tok.shadowEl.setAttribute("d", HL.poly(shadowPts));

            if (dropZ > 2.0) {
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
          // Empty slot: show dashed circle on floor
          tok.emptyEl.style.display = "";
          tok.shadowEl.style.display = "none";
          tok.dropLineEl.style.display = "none";
          HL.put(tok.sol, { sil: "", crease: "" });
        }
      });

      const activeCount = count;
      const topCount = Math.min(5, activeCount);
      const botCount = Math.max(0, activeCount - 5);
      const emptyCount = 10 - activeCount;

      if (activeCount === 10) {
        read.textContent = "Khung đầy 10 ô: 5 + 5 = 10 (Trọn vẹn cơ số mười!)";
      } else if (activeCount === 0) {
        read.textContent = "Khung trống: 0 đồng xu · Cần 10 đồng xu để đầy 10!";
      } else {
        read.textContent = `${activeCount} đồng xu = ${topCount} (hàng trên) + ${botCount} (hàng dưới) · Còn thiếu ${emptyCount} để đủ 10! (${activeCount} + ${emptyCount} = 10)`;
      }
    }

    function aim(pt) {
      if (!pt) {
        applyCount(7);
        return;
      }
      const pLeft = P(-40, 0, 3)[0];
      const pRight = P(40, 0, 3)[0];
      const norm = HL.clamp((pt[0] - pLeft) / (pRight - pLeft), 0, 1);
      const targetCount = Math.round(norm * 10);
      applyCount(targetCount);
    }

    const reg = HL.register(stage, dt => {
      let moving = false;
      tokens.forEach(t => {
        if (HL.stepS(t.dropSp, dt)) moving = true;
      });
      draw();
      return moving;
    });

    bag.add(reg.unregister);
    bag.add(
      HL.pointer(stage, {
        move: aim,
        leave: () => applyCount(7)
      })
    );
    bag.add(() => svg.replaceChildren());

    // Initial render
    draw();

    return {
      set(v) {
        applyCount(Math.round(v));
      },
      destroy: bag.dispose
    };
  }
};
