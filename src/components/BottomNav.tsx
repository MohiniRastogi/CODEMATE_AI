import { Link } from "@tanstack/react-router";
import { Home, History, Bookmark, Settings } from "lucide-react";

export function BottomNav() {
  const items: Array<{
    to: "/app" | "/app/history" | "/app/saved" | "/app/settings";
    label: string;
    icon: typeof Home;
    exact?: boolean;
  }> = [
    { to: "/app", label: "Home", icon: Home, exact: true },
    { to: "/app/history", label: "History", icon: History },
    { to: "/app/saved", label: "Saved", icon: Bookmark },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                activeOptions={{ exact: it.exact }}
                className="group flex flex-col items-center justify-center gap-1 py-2.5 text-subtitle transition data-[status=active]:text-primary"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full transition group-data-[status=active]:gradient-blue group-data-[status=active]:text-white group-data-[status=active]:shadow-glow">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-medium">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
