// Applies a stored French choice to <html lang> before the app loads, so
// assistive tech hears the right language. Kept external to satisfy the CSP.
try {
  if (window.localStorage.getItem("lang") === "fr") {
    document.documentElement.lang = "fr";
  }
} catch {
  // Keep English.
}
