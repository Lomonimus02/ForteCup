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
      <main>{children}</main>
      {footer}
      <CartDrawer />
    </>
  );
}
