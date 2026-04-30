import React from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Accounts } from "./pages/Accounts";
import { Instruments } from "./pages/Instruments";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "accounts", Component: Accounts },
      { path: "instruments", Component: Instruments },
      { path: "settings", Component: Settings },
      { path: "*", Component: () => <div>404 Not Found</div> },
    ],
  },
]);
