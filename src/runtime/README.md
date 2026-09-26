# Runtime contract — planned

Root-scoped mount, play, pause, seek(ms), dispose; shared clock; reduced-motion static pose before autoplay; no dynamic code from IR. Pure reference evaluator must define loop boundaries, direction, easing and parent matrices before adapters are certified. See [Motion IR](../../docs/reference/motion-ir.md).

No player wrapper or evaluator implementation is present yet.
