import React, { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FinanceProvider } from "./context/FinanceContext";
import { LockScreen } from "./components/LockScreen";

export default function App() {
  const securityEnabled =
    localStorage.getItem('s_biometric') === 'true' ||
    localStorage.getItem('s_2fa') === 'true' ||
    !!localStorage.getItem('s_pin');
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
