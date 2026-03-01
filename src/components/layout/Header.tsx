"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { IconBox } from "@/components/ui/IconBox";
import { NAV_LINKS, SITE_NAME } from "@/data/constants";
import { ChevronDown, Menu, X } from "lucide-react";
import type { NavLink } from "@/types";

/* ─── Dropdown item ──────────────────────── */
function NavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  if (!link.children) {
    return (
      <Link href={link.href} className="menu-link text-sm font-medium uppercase">
        {link.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
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
        <div
          className="absolute left-1/2 top-full mt-3 -translate-x-1/2 min-w-[180px] overflow-hidden border-2 border-dark bg-light/95 backdrop-blur-xl"
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
      )}
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

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
      <nav
        className="sticky top-0 z-[1000] mx-auto flex max-w-[1400px] items-center justify-between border-b-2 border-l-2 border-r-2 border-dark px-[30px] py-3"
        style={{
          background: "rgba(244, 244, 240, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "0 0 var(--radius-apple) var(--radius-apple)",
          borderTop: "none",
        }}
      >
        {/* Left links — desktop */}
        <div className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.label} link={link} />
          ))}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex md:hidden h-[45px] w-[45px] items-center justify-center rounded-full border-2 border-dark transition hover:bg-accent"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="relative font-display text-[32px] font-extrabold tracking-tight"
        >
          {SITE_NAME}
          <span className="absolute -right-[15px] top-0 text-xs">®</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {searchOpen && (
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
              className="h-[45px] w-[180px] rounded-full border-2 border-dark bg-white px-4 text-sm font-medium outline-none transition-all focus:border-accent sm:w-[220px]"
            />
          )}

          <IconBox
            onClick={() => {
              if (searchOpen && searchQuery.trim()) {
                handleSearch();
              } else {
                setSearchOpen(!searchOpen);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </IconBox>

          <IconBox onClick={toggleCart} badge={totalBoxes()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </IconBox>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-[65px] z-[999] mx-auto max-w-[1400px] border-2 border-t-0 border-dark bg-light/95 backdrop-blur-xl md:hidden"
          style={{
            borderRadius: "0 0 var(--radius-apple) var(--radius-apple)",
          }}
        >
          <div className="flex flex-col p-6 gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <span className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-dark/40">
                    {link.label}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-3 text-base font-medium uppercase tracking-wide transition-colors hover:text-accent"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-base font-bold uppercase tracking-wide transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
