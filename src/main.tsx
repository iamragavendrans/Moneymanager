
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { Toaster } from "sonner";
  import React from "react";
  import { CapacitorUpdater } from "@capgo/capacitor-updater";

  // Tell Capgo the current bundle loaded successfully so it isn't rolled back
  if ((window as any).Capacitor?.isNativePlatform()) {
    CapacitorUpdater.notifyAppReady();
  }

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster position="bottom-center" richColors expand />
    </>
  );
  