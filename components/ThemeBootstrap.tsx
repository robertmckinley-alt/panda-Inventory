"use client";

import { useEffect } from "react";

/**
 * Read the persisted theme preference and apply it to <html> before paint.
 * This runs as a client component so the user's OS preference is honored
 * on the first render and then locked in by their explicit toggle.
 */
export function ThemeBootstrap() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark || true;
    document.documentElement.classList.toggle("dark", dark);
  }, []);
  return null;
}
