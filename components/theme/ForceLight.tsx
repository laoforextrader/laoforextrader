/**
 * Pins a route to the light palette.
 *
 * Some pages haven't been designed for dark yet — /admin, the calculators
 * (one of which paints a <canvas> with its own fixed colours) and the payment
 * flow, where readers compare an uploaded slip against a QR code. Rather than
 * ship them half-converted, they render this marker and
 * `html.dark:has([data-force-light])` in globals.css re-declares the light
 * tokens. The surrounding Navbar/Footer read the same tokens, so the whole
 * page stays consistent instead of a dark chrome framing a light sheet.
 *
 * Server component, no JS and no flash: the marker is in the initial HTML.
 * Deleting this one line is all it takes to opt a route into dark later.
 */
export default function ForceLight() {
  return <span data-force-light hidden aria-hidden="true" />
}
