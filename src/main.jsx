/**
 * main.jsx
 * ============================================================
 * Punto de entrada de Athena Core. Monta el componente raíz
 * <App /> dentro de #root usando el nuevo API de createRoot.
 * ============================================================
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
