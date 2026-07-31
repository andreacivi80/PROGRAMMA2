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
  const current = new URL(window.location.href);
  if (current.searchParams.has("__ec_update")) {
    current.searchParams.delete("__ec_update");
    window.history.replaceState(null, "", `${current.pathname}${current.search}${current.hash}`);
  }
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
