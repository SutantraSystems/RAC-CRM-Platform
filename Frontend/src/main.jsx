import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import favicon from "./assets/favicon.png"; 
const faviconLink = document.querySelector("link[rel~='icon']");
if (faviconLink) {
  faviconLink.href = favicon;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);