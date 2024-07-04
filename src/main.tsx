import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./components/languageContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider defaultLanguage="english">
          <Router>
            <App />
          </Router>
    </LanguageProvider>
  </React.StrictMode>
);
