import React from "react";
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

// 🔹 Fonction pour mettre à jour la StatusBar selon le thème
const updateStatusBar = async (isDark: boolean) => {
  try {
    const backgroundColor = isDark ? "#0a1628" : "#ffffff";
    const style = isDark ? Style.Dark : Style.Light;
    
    await StatusBar.setBackgroundColor({ color: backgroundColor });
    await StatusBar.setStyle({ style });
  } catch (err) {
    console.warn("Could not update StatusBar:", err);
  }
};

// 🔹 Fonction pour détecter le thème actuel
const getCurrentTheme = (): boolean => {
  // 1. Vérifier le localStorage (préférence utilisateur)
  const storedTheme = localStorage.getItem("theme");
  
  if (storedTheme === "dark") return true;
  if (storedTheme === "light") return false;
  
  // 2. Vérifier si "system" et détecter le thème système
  if (storedTheme === "system" || !storedTheme) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  
  return false;
};

// 🔹 Initialisation Capacitor : StatusBar + Clavier
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Barre de statut Android/iOS
    await StatusBar.setOverlaysWebView({ overlay: false });
    
    // Appliquer le thème initial
    const isDark = getCurrentTheme();
    await updateStatusBar(isDark);

    // Gestion du clavier
    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    
    // Observer les changements de thème
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const htmlElement = mutation.target as HTMLElement;
          const isDark = htmlElement.classList.contains("dark");
          updateStatusBar(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
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
