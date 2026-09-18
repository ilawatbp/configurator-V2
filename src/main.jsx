import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./index.css";
import App from "./App.jsx";

import { ConfiguratorProvider } from "./context/ConfiguratorContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename="/configurator-V2">
        <ConfiguratorProvider>
          <App />
        </ConfiguratorProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);