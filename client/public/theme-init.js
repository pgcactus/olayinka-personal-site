// Applies a stored dark theme before first paint, so prerendered pages do not
// flash light while the app loads. Kept external to satisfy the CSP.
try {
  if (window.localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {
  // Use the default light theme when browser storage is unavailable.
}
