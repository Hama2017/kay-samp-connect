import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

// 🔹 Déclare Capacitor globalement pour TypeScript
declare global {
  interface Window {
    Capacitor?: any;
  }
}

// 🔹 Initialisation Capacitor : StatusBar + Clavier
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Barre de statut Android/iOS
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({color: "#ffffff"})
    await StatusBar.setStyle({ style: Style.Light });

    // Gestion du clavier
    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
  } catch (err) {
    console.warn("Capacitor plugins not available in this environment:", err);
  }
});

// 🔹 Enregistrement du Service Worker (version web uniquement)
if ("serviceWorker" in navigator && !window.Capacitor) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// 🔹 Montage de l'application React
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <App />
  </ThemeProvider>
);
