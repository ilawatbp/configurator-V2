import { BrowserRouter } from "react-router";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ConfiguratorProvider } from "./context/ConfiguratorContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/configurator-V2">
      <ConfiguratorProvider >
        <App />
      </ConfiguratorProvider >
    </BrowserRouter>
  </StrictMode>,
);
