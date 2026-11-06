// /tools used to render <ForceLight />, which pinned the whole route to the
// light palette. That was the honest call at the time — the calculators held
// a set of fixed light fills, and the lot-curve designer paints a Chart.js
// canvas whose grid colour was a near-black that disappears on a dark page.
//
// Those are converted now: the fixed fills became the -soft/-ink/-line token
// families that flip with the theme, and the designer resolves its CSS
// variables to real colours before handing them to the canvas and rebuilds
// the charts when <html class="dark"> changes. So the pin comes off.
//
// Two bugs surfaced in that conversion, both from mixing CSS variables with
// raw hex: `var(--accent)14` as a background and `ctx.strokeStyle =
// "var(--accent)"` are each silently invalid, so the selected mode chip had
// no tint and the lot curve drew in default black instead of its mode colour.
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
