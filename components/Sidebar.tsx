"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skus", label: "All SKUs", icon: Package },
  { href: "/alerts", label: "Reorder Alerts", icon: Bell }
];

const LOGO_DARK = "https://phatpanda.com/assets/img/logos/PP-WhiteGreen-Stacked.svg";
const LOGO_LIGHT = "https://phatpanda.com/assets/img/logos/PP-BlackGreen-Square.svg";

export function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <aside
      className="hidden md:flex w-[232px] shrink-0 flex-col border-r"
      style={{ borderColor: "var(--border)", background: "var(--panel)" }}
    >
      <div className="px-5 pt-6 pb-5 flex flex-col items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dark ? LOGO_DARK : LOGO_LIGHT}
          alt="Phat Panda"
          style={{ height: 64, width: "auto", display: "block" }}
        />
        <div className="wordmark text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
          Packaging Controls
        </div>
      </div>

      <nav className="px-3 flex-1 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition relative"
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-muted)",
                fontWeight: active ? 600 : 500,
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                paddingLeft: active ? 10 : 12
              }}
            >
              <Icon className="w-4 h-4" style={{ color: active ? "var(--accent)" : "currentColor" }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between rounded-md px-3 py-2 text-[12px] transition"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="flex items-center gap-2">
            {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {dark ? "Dark" : "Light"} mode
          </span>
          <span
            className="relative inline-flex h-4 w-7 rounded-full"
            style={{ background: dark ? "var(--accent)" : "var(--border-strong)" }}
          >
            <span
              className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition"
              style={{ left: dark ? "14px" : "2px" }}
            />
          </span>
        </button>
      </div>
    </aside>
  );
}
