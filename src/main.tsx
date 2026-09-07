import { createRoot } from "react-dom/client";

import "./app.css";
import { Scene } from "./Scene";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(<Scene />);
