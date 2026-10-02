// Resolves the theme BEFORE first paint.
//
// This has to be a blocking inline script in <head>: if the class landed in an
// effect instead, a reader who prefers dark would get a white flash on every
// navigation. It is the only piece of theme code that runs before hydration,
// so it stays tiny and never throws — private-mode localStorage access can
// raise, and a reader must still get a usable page if it does.
//
// Contract shared with ThemeToggle:
//   localStorage["lft-theme"] = "dark" | "light"  → an explicit choice, honoured forever
//   absent                                        → follow the OS setting
const KEY = "lft-theme"

const CODE = `
(function(){
  try {
    var saved = localStorage.getItem(${JSON.stringify(KEY)});
    var dark = saved === "dark" ||
      (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`.trim()

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: CODE }} />
}
