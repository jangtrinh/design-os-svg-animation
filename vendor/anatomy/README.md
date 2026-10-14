# Vendored from wheresryan22/anatomy

Source: https://github.com/wheresryan22/anatomy @ e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f (MIT, see LICENSE).
All files are copied unmodified.

- `scripts/drive.mjs`, `chrome-port.mjs`, `line-ends.mjs`, `lines.mjs`: headless Chrome driver and the line-end check.
  Hairline adapter: `scripts/check-hairline-line-ends.mjs` (`npm run audit:line-ends`).
- `kit/iso-kit.mjs`, `lathe.mjs`, `tube.mjs`, `audit.mjs`, `iso.css`: isometric geometry kit and the geometry audit.
  Used by `playground/physics-figures/physics-lever-geometry.mjs`; audited by `scripts/audit-physics-lever.mjs`.
- `references/kit.md`, `references/craft.md`, `examples/dial-indicator/build.mjs`: reference docs for figure authors.
