# Geometry adapter contract — planned

Input: parsed SVG geometry, explicit coordinate system, tolerance and immutable asset hash.
Output: canonical cubic contours, measurements, correspondence mapping, repair log and error metrics.

Choose one adapter per operation: Paper for geometry primitives; flubber for qualified closed single contours; polymorph-js only after corpus qualification; opentype.js for font outlines after shaping/permission checks. Reject ambiguous topology changes. See [repair specification](../../docs/reference/ai-capabilities-and-repair.md).

No repair implementation is present yet.
