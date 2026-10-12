/*
 * 4. Distillation Apparatus & Liebig Condenser (Bộ Chưng Cất Phân Đoạn & Ống Sinh Hàn Liebig)
 * Chemical Concept: Phương pháp chưng cất tách chất theo nhiệt độ sôi (Fractional Distillation):
 *   - Hỗn hợp nhị phân: Ethanol (t_sôi = 78.3°C) và Nước (t_sôi = 100.0°C).
 *   - Khi đun tới t° ≥ 78.3°C: Áp suất hơi bão hòa p_et = 1 atm, ethanol sôi bay hơi trước.
 *   - Hơi cồn đi lên cổ bình, tiếp xúc bầu thủy ngân nhiệt kế (ghi nhận 78.3°C), rẽ vào ống sinh hàn Liebig.
 *   - Dòng nước làm mát đối lưu (Counter-current cooling: Nước vào ở đầu thấp, ra ở đầu cao)
 *     hấp thụ nhiệt hóa hơi (ΔH_vap = 38.56 kJ/mol), ngưng tụ hơi cồn thành dòng giọt lỏng tinh khiết.
 * Geometry (Lucas Markes Specimen Discipline):
 *   - Hai giá kẹp thí nghiệm độc lập (Retort Stands) bằng gang nặng với khớp nối bosshead và kẹp 3 chạc.
 *   - Bình cầu đáy tròn trong bếp gia nhiệt điện (Electric Heating Mantle).
 *   - Ống sinh hàn Liebig 2 lớp thủy tinh thật: Ống dẫn hơi bên trong, áo nước làm mát bên ngoài
 *     có 2 vòi nhánh dẫn nước vào (inlet) và nước ra (outlet).
 *   - Đầu nối cong (bent receiving adapter) dẫn giọt cồn vào bình tam giác Erlenmeyer.
 *   - 100% opaque, không polygon phẳng thay thế, không bug offset prism.
 * Kinematics:
 *   - Di chuột điều chỉnh nhiệt độ từ 50°C đến 95°C.
 *   - t° < 78.3°C: Hỗn hợp chỉ nóng lên, nhiệt kế dâng, bình hứng khô cạn (0 mL).
 *   - t° ≥ 78.3°C: Sôi mãnh liệt, hơi dâng, giọt ngưng tụ rơi liên tục vào bình tam giác,
 *     thể tích cồn thu hồi tích lũy thời gian thực.
 */

export default {
  id: "chemistry-distillation",
  title: "4. Chưng Cất & Sinh Hàn (Liebig Distillation)",
  concept: "Chưng cất phân đoạn hỗn hợp C₂H₅OH - H₂O · t_sôi = 78.3°C · Trao đổi nhiệt đối lưu",
  means: "Di chuột tăng nhiệt độ bếp đun từ 50°C đến 95°C. Khi vượt 78.3°C (điểm sôi của ethanol), hơi bốc lên qua ống sinh hàn Liebig ngưng tụ thành dòng giọt chảy vào bình tam giác.",
  rules: [1, 2, 4, 6, 9],
  range: [50, 78.3, 95],
  mount({ stage, svg, read }, initialV) {
    const bag = HL.disposer();
    const C = HL.Cam(45, 0.5, 3.2);
    HL.fit(C, [[-27, -6, 0], [22, 6, 35]], 200, 160);
    const P = HL.proj(C), front = HL.facing(C);

    function circAt(cx, cy, R, n = 28) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
      }
      return out;
    }

    // 1. Two Independent Cast-Iron Retort Stands (Hai giá thí nghiệm gang)
    // Left Stand (holding heating mantle & flask): Base at X = -21, Y = 0, Z = 0 to 2.2
    const stand1Sol = HL.solid(svg);
    const [st1O, st1I] = HL.rings(-27, -5, -15, 5, 1.2, 0.4);
    HL.put(stand1Sol, HL.prism(P, front, st1O, st1I, 0, 2.2));

    // Stand 1 vertical rod at (-21, -3.5, Z = 2.2 to 34.0)
    const rod1Sol = HL.solid(svg);
    const rod1O = circAt(-21, -3.5, 0.9, 16);
    const rod1I = circAt(-21, -3.5, 0.6, 16);
    HL.put(rod1Sol, HL.prism(P, front, rod1O, rod1I, 2.2, 34.0));

    // Stand 1 Bosshead clamp at Z = 20.0 holding flask neck
    const clamp1Sol = HL.solid(svg);
    const [cl1O, cl1I] = HL.rings(-22.2, -4.5, -19.8, -2.5, 0.4, 0.2);
    HL.put(clamp1Sol, HL.prism(P, front, cl1O, cl1I, 19.5, 21.0));

    // Right Stand (holding angled Liebig condenser): Base at X = 7, Y = 0, Z = 0 to 2.2
    const stand2Sol = HL.solid(svg);
    const [st2O, st2I] = HL.rings(2, -5, 12, 5, 1.2, 0.4);
    HL.put(stand2Sol, HL.prism(P, front, st2O, st2I, 0, 2.2));

    // Stand 2 vertical rod at (7, -3.5, Z = 2.2 to 28.0)
    const rod2Sol = HL.solid(svg);
    const rod2O = circAt(7, -3.5, 0.9, 16);
    const rod2I = circAt(7, -3.5, 0.6, 16);
    HL.put(rod2Sol, HL.prism(P, front, rod2O, rod2I, 2.2, 28.0));

    // Stand 2 3-prong clamp at Z = 14.5 gripping condenser jacket
    const clamp2Sol = HL.solid(svg);
    const [cl2O, cl2I] = HL.rings(5.8, -4.5, 8.2, -2.5, 0.4, 0.2);
    HL.put(clamp2Sol, HL.prism(P, front, cl2O, cl2I, 14.0, 15.5));

    // 2. Electric Heating Mantle (Bếp gia nhiệt điện) at X = -21, Y = 0, Z = 2.2 to 8.5
    const mantleSol = HL.solid(svg);
    const mantleO = circAt(-21, 0, 6.4, 24);
    const mantleI = circAt(-21, 0, 5.2, 24);
    HL.put(mantleSol, HL.prism(P, front, mantleO, mantleI, 2.2, 8.5));

    // 3. Round-Bottom Distillation Flask (Bình cầu đáy tròn 250mL)
    // Spherical bulb centered at (-21, 0, 13.0) with radius 5.6
    const flaskGroup = HL.mk("g", {}, svg);
    const flaskBulb = HL.mk("circle", { r: 5.6 * 2.1, class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4 }, flaskGroup);
    const flaskLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, flaskGroup);
    const boilBubbles = HL.mk("g", { class: "lo" }, flaskGroup);

    // Position sphere center on screen
    const bulbP = P(-21, 0, 13.0);
    flaskBulb.setAttribute("cx", HL.r2(bulbP[0]));
    flaskBulb.setAttribute("cy", HL.r2(bulbP[1]));

    // Flask vertical neck from Z = 16.5 up to Z = 25.0 (width 3.2)
    const flaskNeckSol = HL.solid(flaskGroup);
    const neckO = circAt(-21, 0, 1.8, 18);
    const neckI = circAt(-21, 0, 1.4, 18);
    HL.put(flaskNeckSol, HL.prism(P, front, neckO, neckI, 16.5, 25.0));

    // Thermometer thread inside neck: rubber stopper at Z = 25.0, stem down to Z = 19.5
    const thStem = HL.mk("line", {
      x1: HL.r2(P(-21, 0, 27.0)[0]), y1: HL.r2(P(-21, 0, 27.0)[1]),
      x2: HL.r2(P(-21, 0, 19.0)[0]), y2: HL.r2(P(-21, 0, 19.0)[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, flaskGroup);

    // 4. Liebig Condenser (Ống sinh hàn 2 lớp kính nghiêng)
    // Side arm from flask neck at (-21, 0, 21.0) branching to start of condenser at (-15, 0, 19.5)
    const condenserGroup = HL.mk("g", {}, svg);
    const sideArm = HL.mk("line", {
      x1: HL.r2(P(-21, 0, 21.0)[0]), y1: HL.r2(P(-21, 0, 21.0)[1]),
      x2: HL.r2(P(-15, 0, 19.5)[0]), y2: HL.r2(P(-15, 0, 19.5)[1]),
      class: "sil", stroke: "var(--hl-edge)", "stroke-width": 2.4
    }, condenserGroup);

    // Condenser span: from A(-15, 0, 19.5) down to B(13, 0, 8.5)
    const cA = [-15, 0, 19.5];
    const cB = [13, 0, 8.5];
    const cDx = cB[0] - cA[0], cDz = cB[2] - cA[2];
    const cLen = Math.hypot(cDx, cDz);
    const ux = cDx / cLen, uz = cDz / cLen;
    const nx = -uz, nz = ux; // 2D normal perpendicular to condenser axis

    // Outer cooling water jacket: from s = 3.0 to s = 25.0 along axis, radius 2.6
    const jStartS = 3.0, jEndS = 25.0;
    const jR = 2.6;
    const jP0 = P(cA[0] + jStartS * ux + jR * nx, 0, cA[2] + jStartS * uz + jR * nz);
    const jP1 = P(cA[0] + jStartS * ux - jR * nx, 0, cA[2] + jStartS * uz - jR * nz);
    const jP2 = P(cA[0] + jEndS * ux - jR * nx, 0, cA[2] + jEndS * uz - jR * nz);
    const jP3 = P(cA[0] + jEndS * ux + jR * nx, 0, cA[2] + jEndS * uz + jR * nz);

    const jacketPoly = HL.mk("polygon", {
      points: [jP0, jP1, jP2, jP3].map(p => `${HL.r2(p[0])},${HL.r2(p[1])}`).join(" "),
      class: "sil", fill: "var(--hl-plate)", stroke: "var(--hl-edge)", "stroke-width": 1.4
    }, condenserGroup);

    // Water Inlet nozzle (near lower end, pointing down-forward)
    const inNozzleA = P(cA[0] + 22.0 * ux, 0, cA[2] + 22.0 * uz - jR);
    const inNozzleB = P(cA[0] + 22.0 * ux, 0, cA[2] + 22.0 * uz - (jR + 3.0));
    HL.mk("line", {
      x1: HL.r2(inNozzleA[0]), y1: HL.r2(inNozzleA[1]),
      x2: HL.r2(inNozzleB[0]), y2: HL.r2(inNozzleB[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.8
    }, condenserGroup);

    // Water Outlet nozzle (near upper end, pointing up-backward)
    const outNozzleA = P(cA[0] + 6.0 * ux, 0, cA[2] + 6.0 * uz + jR);
    const outNozzleB = P(cA[0] + 6.0 * ux, 0, cA[2] + 6.0 * uz + (jR + 3.0));
    HL.mk("line", {
      x1: HL.r2(outNozzleA[0]), y1: HL.r2(outNozzleA[1]),
      x2: HL.r2(outNozzleB[0]), y2: HL.r2(outNozzleB[1]),
      class: "hi", stroke: "var(--hl-edge)", "stroke-width": 1.8
    }, condenserGroup);

    // Inner vapor tube (inside condenser, extending through)
    const innerTube = HL.mk("line", {
      x1: HL.r2(P(cA[0], 0, cA[2])[0]), y1: HL.r2(P(cA[0], 0, cA[2])[1]),
      x2: HL.r2(P(cB[0], 0, cB[2])[0]), y2: HL.r2(P(cB[0], 0, cB[2])[1]),
      class: "lo", stroke: "var(--hl-edge)", "stroke-width": 1.2
    }, condenserGroup);

    // Bent Receiving Adapter (ống sừng bò cong) at condenser exit B -> Erlenmeyer flask
    const adaptTipWorld = [cB[0] + 3.0, 0, 5.0];
    const adaptTip = P(...adaptTipWorld);
    const adapterPath = HL.mk("path", {
      d: `M ${HL.r2(P(cB[0], 0, cB[2])[0])} ${HL.r2(P(cB[0], 0, cB[2])[1])} Q ${HL.r2(P(cB[0] + 2.5, 0, cB[2] - 1.0)[0])} ${HL.r2(P(cB[0] + 2.5, 0, cB[2] - 1.0)[1])} ${HL.r2(adaptTip[0])} ${HL.r2(adaptTip[1])}`,
      class: "sil", fill: "none", stroke: "var(--hl-edge)", "stroke-width": 1.6
    }, condenserGroup);

    // 5. Receiving Erlenmeyer Flask (Bình tam giác hứng sản phẩm) at X = 17, Y = 0, Z = 0 to 6.5
    const recGroup = HL.mk("g", {}, svg);
    const recBaseP0 = P(12.5, -4.0, 0.1), recBaseP1 = P(21.5, -4.0, 0.1);
    const recBaseP2 = P(21.5, 4.0, 0.1), recBaseP3 = P(12.5, 4.0, 0.1);
    const recNeckP0 = P(15.5, -1.8, 6.0), recNeckP1 = P(18.5, -1.8, 6.0);
    const recNeckP2 = P(18.5, 1.8, 6.0), recNeckP3 = P(15.5, 1.8, 6.0);

    // 3D Erlenmeyer flask prism body
    const recFlaskSol = HL.solid(recGroup);
    const recO = circAt(17, 0, 5.5, 24);
    const recI = circAt(17, 0, 4.4, 24);
    HL.put(recFlaskSol, HL.prism(P, front, recO, recI, 0, 6.0));

    const recLiquid = HL.mk("path", { class: "lo", fill: "var(--hl-plate)", stroke: "var(--hl-edge)" }, recGroup);

    // Droplets running down inner tube & dripping into flask
    const dropGroup = HL.mk("g", { class: "hi" }, svg);
    const dropDots = [];
    for (let d = 0; d < 5; d++) {
      const dot = HL.mk("circle", { r: 1.2, fill: "var(--hl-edge)", stroke: "none", opacity: 0 }, dropGroup);
      dropDots.push(dot);
    }

    // Kinematic Springs & State
    const initialT = initialV != null ? initialV : 78.3;
    const spTemp = HL.spring(initialT, { k: 120, c: 14 }); // Temperature 50°C -> 95°C
    let accumulatedVolume = 0; // Accumulated distillate volume (mL)
    let dropPhase = 0;

    function draw() {
      const temp = spTemp.x;
      const isBoiling = temp >= 78.3;

      // Rate of distillation increases with temperature above 78.3°C
      const boilIntensity = isBoiling ? Math.min(1.0, (temp - 78.3) / 12.0) : 0;

      // Update liquid in boiling flask (decreases slightly as distilled)
      const flaskLiqZ = 13.0 - (accumulatedVolume * 0.08);
      const flP0 = P(-25.5, 0, flaskLiqZ), flP1 = P(-16.5, 0, flaskLiqZ);
      flaskLiquid.setAttribute("d", `M ${HL.r2(flP0[0])} ${HL.r2(flP0[1])} L ${HL.r2(flP1[0])} ${HL.r2(flP1[1])}`);

      // Condensation Droplets Animation
      if (isBoiling) {
        dropPhase = (dropPhase + 0.04 * (1 + boilIntensity)) % 1;
        for (let d = 0; d < dropDots.length; d++) {
          const s = (dropPhase + d / dropDots.length) % 1;
          let curX, curZ;
          if (s < 0.75) {
            // Sliding down inner tube
            const frac = s / 0.75;
            curX = cA[0] + frac * cDx;
            curZ = cA[2] + frac * cDz;
          } else {
            // Free dripping from adapter tip into receiving flask
            const frac = (s - 0.75) / 0.25;
            curX = adaptTipWorld[0];
            curZ = adaptTipWorld[2] - frac * 3.5;
          }
          const dp = P(curX, 0, curZ);
          dropDots[d].setAttribute("cx", HL.r2(dp[0]));
          dropDots[d].setAttribute("cy", HL.r2(dp[1]));
          dropDots[d].setAttribute("opacity", "1");
        }
      } else {
        for (const dot of dropDots) {
          dot.setAttribute("opacity", "0");
        }
      }

      // Distillate volume in receiving flask
      const recLevelZ = 0.5 + Math.min(4.5, accumulatedVolume * 0.15);
      const rkP0 = P(14.0, 0, recLevelZ), rkP1 = P(20.0, 0, recLevelZ);
      recLiquid.setAttribute("d", `M ${HL.r2(rkP0[0])} ${HL.r2(rkP0[1])} L ${HL.r2(rkP1[0])} ${HL.r2(rkP1[1])}`);

      // Readout
      if (isBoiling) {
        const rate = (0.8 + boilIntensity * 1.6).toFixed(1);
        read.textContent = `T = ${temp.toFixed(1)}°C (≥ 78.3°C) · C₂H₅OH sôi & ngưng tụ · Tốc độ: ${rate} mL/min · Thu hồi: ${accumulatedVolume.toFixed(1)} mL (.hi)`;
      } else {
        const remain = (78.3 - temp).toFixed(1);
        read.textContent = `T = ${temp.toFixed(1)}°C (< 78.3°C) · Gia nhiệt hỗn hợp (cần thêm +${remain}°C để sôi) · Bình hứng: ${accumulatedVolume.toFixed(1)} mL`;
      }
    }

    function setTemp(val) {
      spTemp.t = HL.clamp(val, 50, 95);
      reg.wake();
    }

    function aim(pt) {
      if (!pt) {
        setTemp(78.3);
        return;
      }
      const minX = 60, maxX = 340;
      const norm = HL.clamp((pt[0] - minX) / (maxX - minX), 0, 1);
      setTemp(50 + norm * 45.0);
    }

    const reg = HL.register(stage, dt => {
      const moving = HL.stepS(spTemp, dt);
      if (spTemp.x >= 78.3) {
        const rate = 0.5 + ((spTemp.x - 78.3) / 12.0) * 1.5;
        accumulatedVolume = Math.min(25.0, accumulatedVolume + rate * dt);
      }
      draw();
      return moving || spTemp.x >= 78.3;
    });

    bag.add(reg.unregister);
    bag.add(HL.pointer(stage, { move: aim, leave: () => aim(null) }));
    bag.add(() => svg.replaceChildren());

    draw();

    return {
      set(v) {
        setTemp(Number(v));
      },
      destroy: bag.dispose,
      dispose: bag.dispose
    };
  }
};
