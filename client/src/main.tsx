import "./index.css";

function hydrateWhenIdle() {
  import("./main-client").then(({ startClient }) => startClient());
}

const hasPrerenderedHtml = Boolean(document.getElementById("root")?.innerHTML.trim());

if (window.location.pathname.replace(/\/+$/, "") === "/things/places" && hasPrerenderedHtml) {
  import("./places-client").then(({ startPlacesClient }) => startPlacesClient());
} else if (document.readyState === "complete") {
  window.setTimeout(hydrateWhenIdle, 0);
} else {
  window.addEventListener("load", () => window.setTimeout(hydrateWhenIdle, 0), { once: true });
}
