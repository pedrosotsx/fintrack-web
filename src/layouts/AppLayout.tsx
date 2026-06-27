import {
  LayoutDashboard,
  LogOut,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { ComponentType } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

interface NavigationItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

type NavigationVariant = "sidebar" | "bottom";

const navigation: NavigationItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Receitas", to: "/receitas", icon: TrendingUp },
  { label: "Despesas", to: "/despesas", icon: TrendingDown },
  { label: "Categorias", to: "/categorias", icon: Tags },
  { label: "Metas", to: "/metas", icon: Target },
];

function NavigationLinks({ variant = "sidebar" }: { variant?: NavigationVariant }) {
  return (
    <nav
      className={cn(
        variant === "bottom"
          ? "grid grid-cols-5 gap-1"
          : "flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
      )}
    >
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                variant === "bottom"
                  ? "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium leading-none transition"
                  : "flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                isActive
                  ? "bg-fin-red text-white"
                  : "text-fin-muted hover:bg-zinc-900 hover:text-fin-text"
              )
            }
          >
            <Icon className={cn(variant === "bottom" ? "h-5 w-5" : "h-4 w-4")} />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-fin-background text-fin-text">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-fin-border bg-fin-panel p-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-fin-red text-white">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold">FinSecurity</p>
            <p className="text-xs text-fin-muted">Controle financeiro</p>
          </div>
        </div>

        <div className="mt-10 flex-1">
          <NavigationLinks />
        </div>

        <Button
          type="button"
          variant="ghost"
          icon={<LogOut className="h-4 w-4" />}
          onClick={handleLogout}
        >
          Sair
        </Button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-fin-border bg-fin-background/95 px-3 py-3 backdrop-blur sm:px-4 md:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-fin-red text-white">
                <WalletCards className="h-5 w-5" />
              </div>
              <p className="truncate text-lg font-bold">FinTrack</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<LogOut className="h-4 w-4" />}
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-3 py-5 pb-24 sm:px-4 md:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-fin-border bg-fin-panel/98 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
        <NavigationLinks variant="bottom" />
      </div>
    </div>
  );
}
