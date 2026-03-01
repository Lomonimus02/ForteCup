"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface LayoutShellProps {
  children: ReactNode;
  footer: ReactNode;
}

export function LayoutShell({ children, footer }: LayoutShellProps) {
  return (
    <>
      <Header />
      {/* pt offsets the fixed header height */}
      <main className="pt-[52px] sm:pt-[58px] md:pt-[62px]">{children}</main>
      {footer}
      <CartDrawer />
    </>
  );
}
