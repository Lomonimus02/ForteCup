"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { IconBox } from "@/components/ui/IconBox";
import { NAV_LINKS, SITE_NAME } from "@/data/constants";
import { ChevronDown, Menu, X, ShoppingCart, Search } from "lucide-react";
import type { NavLink } from "@/types";

/* ─── Desktop dropdown item ──────────────── */
function NavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (!link.children) {
    return (
      <Link href={link.href} className="menu-link text-sm font-medium uppercase">
        {link.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className="menu-link flex items-center gap-1 text-sm font-medium uppercase"
      >
        {link.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 min-w-[180px] pt-3">
          <div
            className="overflow-hidden border-2 border-dark bg-light/95 backdrop-blur-xl"
            style={{ borderRadius: "var(--radius-apple)" }}
          >
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-5 py-3 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-accent hover:text-dark"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile menu accordion item ─────────── */
function MobileNavItem({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (!link.children) {
    return (
      <Link
        href={link.href}
        onClick={onNavigate}
        className="block py-3 font-display text-3xl font-extrabold uppercase text-light transition-colors active:text-accent"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3"
      >
        <span className="font-display text-3xl font-extrabold uppercase text-light">
          {link.label}
        </span>
        <ChevronDown
          size={20}
          className={`text-light/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pb-2 pl-4">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className="block py-2.5 text-lg font-bold uppercase text-light/70 transition-colors active:text-accent"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Header ─────────────────────────────── */
export function Header() {
  const router = useRouter();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalBoxes = useCartStore((s) => s.totalBoxes);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  function handleSearch() {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/catalog?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <>
      {/* ── Top nav bar ─────────────────────── */}
      <nav
        className="fixed left-0 right-0 top-0 z-[1000] mx-auto flex max-w-[1400px] items-center justify-between border-b-2 border-l-2 border-r-2 border-dark px-3 py-2.5 sm:px-4 sm:py-3 md:px-[30px]"
        style={{
          background: "rgba(244, 244, 240, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "0 0 var(--radius-apple) var(--radius-apple)",
          borderTop: "none",
        }}
      >
        {/* Left — desktop links */}
        <div className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.label} link={link} />
          ))}
        </div>

        {/* Left — mobile burger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dark transition-colors hover:bg-accent md:hidden"
          aria-label="Открыть меню"
        >
          <Menu size={18} strokeWidth={2.5} />
        </button>

        {/* Center — Logo */}
        <Link
          href="/"
          className="relative font-display text-[22px] font-extrabold tracking-tight sm:text-[28px] md:text-[32px]"
        >
          {SITE_NAME}
          <span className="absolute -right-2.5 top-0 text-[8px] sm:-right-3 sm:top-0 sm:text-[10px] md:-right-[15px] md:text-xs">
            ®
          </span>
        </Link>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Desktop search input */}
          <div
            className={`hidden md:block overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              searchOpen
                ? "w-[180px] sm:w-[220px] opacity-100"
                : "w-0 opacity-0"
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setSearchQuery("");
                }
              }}
              onBlur={() => {
                if (!searchQuery) setSearchOpen(false);
              }}
              placeholder="Поиск..."
              className="h-[45px] w-[180px] rounded-full border-2 border-dark bg-transparent px-4 text-sm font-medium outline-none transition-colors focus:border-accent sm:w-[220px]"
            />
          </div>

          {/* Desktop search button */}
          <IconBox
            className="hidden md:flex"
            onClick={() => {
              if (searchOpen && searchQuery.trim()) {
                handleSearch();
              } else {
                setSearchOpen(!searchOpen);
              }
            }}
          >
            <Search size={18} />
          </IconBox>

          {/* Cart — always visible */}
          <button
            onClick={toggleCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-dark transition-colors hover:bg-dark hover:text-accent sm:h-[45px] sm:w-[45px]"
            aria-label="Корзина"
          >
            <ShoppingCart size={17} strokeWidth={2} />
            {totalBoxes() > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-[9px] font-bold text-dark sm:h-5 sm:w-5 sm:text-[10px]">
                {totalBoxes()}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Full-screen mobile menu ─────────── */}

      {/* Overlay panel — covers entire screen */}
      <div
        className={`fixed inset-0 z-[1100] flex flex-col bg-dark transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:pointer-events-none md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link
            href="/"
            onClick={closeMobile}
            className="font-display text-xl font-extrabold text-accent sm:text-2xl"
          >
            {SITE_NAME}
          </Link>
          <button
            onClick={closeMobile}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-light/20 text-light transition-colors hover:border-accent hover:text-accent sm:h-11 sm:w-11"
            aria-label="Закрыть меню"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links — scrollable, centered */}
        <nav className="flex flex-1 flex-col justify-center overflow-y-auto px-6 sm:px-10">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <MobileNavItem
                key={link.label}
                link={link}
                onNavigate={closeMobile}
              />
            ))}
          </div>
        </nav>

        {/* Panel footer — cart + info */}
        <div className="flex items-center justify-between border-t border-light/10 px-6 py-5 sm:px-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-light/30">
            МОСКВА / РФ
          </span>
          <button
            onClick={() => { closeMobile(); toggleCart(); }}
            className="flex items-center gap-2 rounded-full border-2 border-light/20 px-4 py-2 text-xs font-bold uppercase text-light transition-colors hover:border-accent hover:text-accent"
          >
            <ShoppingCart size={15} />
            Корзина
            {totalBoxes() > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-dark">
                {totalBoxes()}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
