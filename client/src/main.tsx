import { createRoot, hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import { useTransitionLocation } from "./lib/transition-location";
import "./index.css";
import "./site.css";

const rootEl = document.getElementById("root")!;

// If the root element already has server-rendered HTML (from prerender),
// hydrate it; otherwise do a fresh client-side render.
const app = (
  <Router hook={useTransitionLocation}>
    <App />
  </Router>
);

if (rootEl.innerHTML.trim().length > 0) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
