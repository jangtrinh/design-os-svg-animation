// Anatomy audit for the physics lever at a left-heavy, balanced and right-heavy pose.
// Items carry the same painter's key markup() sorts by (no A.settle), so a wrong draw order fails here.
// The flag is forced on so `node scripts/audit-physics-lever.mjs` prints the verdict without extra args.
import * as k from "../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../vendor/anatomy/kit/lathe.mjs";
import * as A from "../vendor/anatomy/kit/audit.mjs";
import { contribute, frame, model } from "../playground/physics-figures/physics-lever-geometry.mjs";

const kit = { ...k, prismOf: G.prismOf, disc: G.disc };
const view = frame(kit);
for (const xf of [-20, -8, 15]) {
  const R = A.recorder(view.P);
  contribute(R, kit, A, view.P, { xf, theta: model(xf).theta, accent: "beam" });
  const overlaps = A.overlapsOf(R.items, view.P, { states: [0], skip: A.sameRun });
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map((item) => item.key), rules: 0, cycles: [], dropped: [] }, states: [0] };
  console.log(`pose xf=${xf} theta=${model(xf).theta.toFixed(3)}`);
  A.auditOrExit(R, view.P, { argv: ["node", "audit-physics-lever.mjs", "--audit"], crowd: [] });
}
