import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;

// If the root element already has server-rendered HTML (from prerender),
// hydrate it; otherwise do a fresh client-side render.
if (rootEl.innerHTML.trim().length > 0) {
  hydrateRoot(rootEl, <App />);
} else {
  createRoot(rootEl).render(<App />);
}
