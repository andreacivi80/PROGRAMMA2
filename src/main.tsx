import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator) {
  let refreshing = false;
  const refreshThroughCache = () => {
    if (refreshing) return;
    refreshing = true;
    const target = new URL(window.location.href);
    target.searchParams.set("__ec_update", Date.now().toString());
    window.location.replace(target);
  };
  const current = new URL(window.location.href);
  if (current.searchParams.has("__ec_update")) {
    current.searchParams.delete("__ec_update");
    window.history.replaceState(null, "", `${current.pathname}${current.search}${current.hash}`);
  }
  navigator.serviceWorker.addEventListener("controllerchange", refreshThroughCache);
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" })
      .then(async registration => {
        await registration.update();
        registration.waiting?.postMessage("SKIP_WAITING");
      })
      .catch(() => undefined);
  });
}
