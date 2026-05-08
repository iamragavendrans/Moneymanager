import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FinanceProvider } from "./context/FinanceContext";
import { LockScreen } from "./components/LockScreen";

export default function App() {
  const securityEnabled = localStorage.getItem('s_biometric') === 'true';
  const [unlocked, setUnlocked] = useState(!securityEnabled);

  return (
    <FinanceProvider>
      {!unlocked ? (
        <LockScreen onUnlock={() => setUnlocked(true)} />
      ) : (
        <RouterProvider router={router} />
      )}
    </FinanceProvider>
  );
}
