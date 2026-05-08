import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FinanceProvider } from "./context/FinanceContext";
import { LockScreen } from "./components/LockScreen";

export default function App() {
  const securityEnabled = localStorage.getItem('s_biometric') === 'true';
  const [unlocked, setUnlocked] = useState(!securityEnabled);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <FinanceProvider>
      <RouterProvider router={router} />
    </FinanceProvider>
  );
}
