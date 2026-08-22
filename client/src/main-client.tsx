import { createRoot, hydrateRoot } from "react-dom/client";
import AppServer from "./AppServer";

export function startClient() {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  const app = <AppServer />;
  if (rootEl.innerHTML.trim().length > 0) {
    hydrateRoot(rootEl, app);
  } else {
    createRoot(rootEl).render(app);
  }
}
