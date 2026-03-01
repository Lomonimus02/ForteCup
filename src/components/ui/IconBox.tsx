"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface IconBoxProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  badge?: number;
}

export function IconBox({ children, className, onClick, badge }: IconBoxProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-[45px] w-[45px] items-center justify-center rounded-full border-2 border-dark transition-colors duration-200 hover:bg-dark hover:text-accent",
        className
      )}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-dark">
          {badge}
        </span>
      )}
    </button>
  );
}
