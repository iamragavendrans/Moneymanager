import React from "react";
import { createHashRouter, useRouteError, isRouteErrorResponse } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Accounts } from "./pages/Accounts";
import { Investments } from "./pages/Instruments";
import { Settings } from "./pages/Settings";

function RootBoundary() {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto text-3xl mb-2">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Oops! Something went wrong.</h1>
        <p className="text-slate-500 text-sm">
          {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: RootBoundary,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "accounts", Component: Accounts },
      { path: "investments", Component: Investments },
      { path: "settings", Component: Settings },
      { path: "*", Component: () => <div>404 Not Found</div> },
    ],
  },
]);
