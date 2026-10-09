# Sol 6.1 Mission Brief: Meaningful Physical Interactions for Math Grade 1 Suite

## 1. Context & Objective
The user requested: "Các interaction của chúng ta không meaningful làm sao trẻ em nhìn vào hiểu được. Nhờ Sol 6.1 hướng dẫn cho mà làm."
We need to upgrade the interaction mechanics in:
1. `playground/math-figures/math-balance.js` (Cân Thăng Bằng - Figure 2)
2. `playground/math-figures/math-fraction-pie.js` (Bánh Phân Số - Figure 9)

## 2. Requirements for Figure 2: `math-balance.js`
- **Eliminate manual mouse-forced tilt.** The balance must tilt due to weight physics ($W_{left} - W_{right}$)!
- **Weights interaction:**
  - Left tray: 3 weights.
  - Right tray: Starts with 2 weights. Tilt rests at $\approx -8^\circ$ (left is heavier: $3 > 2$).
  - A reserve weight station or clickable interaction: Clicking the right tray or clicking the reserve weight ADDS a weight to the right tray ($2 \to 3$).
  - Physics reaction: When weight is added to right tray, total on right = 3. Net torque = 0.
  - Beam oscillates realistically with spring physics (`stepS`) and settles at $0^\circ$ (PERFECT EQUILIBRIUM: $3 = 3$).
  - Clicking again toggles adding a 4th weight ($3 < 4$, tilts right $+8^\circ$), or removes it.
  - Readout updates dynamically:
    - 3 > 2: "Bên trái nặng hơn: 3 > 2 (Cân lệch trái)"
    - 3 = 3: "Thăng bằng hoàn hảo: 3 = 3 (Hai bên bằng nhau!)"
    - 3 < 4: "Bên phải nặng hơn: 3 < 4 (Cân lệch phải)"
  - Slider `intensity` controls adding/removing weights ($2 \leftrightarrow 3 \leftrightarrow 4$).

## 3. Requirements for Figure 9: `math-fraction-pie.js`
- **Eliminate radial exploded view.** Slices should not fly away into 4 corners!
- **Meaningful "Taking a slice" (Bốc bánh ra đĩa):**
  - Pie sits in a round wooden baking tray (left side).
  - A serving plate sits on the right side.
  - Slices are 4 true $90^\circ$ quadrant sectors with thickness.
  - Clicking on a slice (or sliding intensity from 0 to 4):
    - 0 slices taken: All 4 slices sit in the tray: "Bánh nguyên vẹn: 4/4 = 1 cái bánh".
    - 1 slice taken: 1 slice lifts up, travels across to the serving plate, and lands! The baking tray clearly shows a $90^\circ$ empty quadrant! Readout: "Bốc 1 miếng (1/4): Trong khay còn lại 3/4 cái bánh".
    - 2 slices taken: 2 slices on serving plate. The baking tray clearly shows a semicircle ($180^\circ$)! Readout: "Bốc 2 miếng (2/4): Trong khay còn đúng 1/2 cái bánh (một nửa)".
    - 3 slices taken: "Bốc 3 miếng (3/4): Trong khay còn lại 1/4 cái bánh".
    - 4 slices taken: "Đã bốc hết 4/4: Khay trống!".
  - Smooth spring physics for lifting, flying, and docking on the plate.

## 4. Deliverable
Write the updated code directly into:
1. `playground/math-figures/math-balance.js`
2. `playground/math-figures/math-fraction-pie.js`
Ensure clean JS syntax, export default { id, title, concept, means, rules, range, mount() { ... } }, and re-bundle with `node scripts/bundle-math-grade1.mjs`.
