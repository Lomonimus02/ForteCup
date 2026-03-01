"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  FileText,
  Image,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  StickyNote,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/admin/login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: FolderOpen },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/pages", label: "Страницы", icon: StickyNote },
  { href: "/admin/blog", label: "Блог", icon: FileText },
  { href: "/admin/portfolio", label: "Портфолио", icon: Image },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div
      className={`flex flex-col h-full bg-neutral-950 border-r border-neutral-800 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
        {!collapsed && (
          <Link href="/admin" className="font-display text-lg font-bold text-white tracking-tight">
            FORTE CUP
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          title={collapsed ? "Развернуть" : "Свернуть"}
        >
          <ChevronLeft
            size={18}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Logout */}
      <div className="p-2 border-t border-neutral-800">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition-colors w-full"
            title={collapsed ? "Выйти" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span>Выйти</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">{sidebar}</div>
    </>
  );
}
