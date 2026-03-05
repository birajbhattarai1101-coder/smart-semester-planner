import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global reset — removes browser default 8px body margin that causes white gap
const style = document.createElement("style");
style.innerHTML = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #2C1810; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
