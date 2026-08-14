import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import "./styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Mainline 的应用根节点不存在。");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
