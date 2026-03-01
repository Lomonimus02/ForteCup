import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-xl border border-dark bg-accent px-3.5 py-1.5 text-[11px] font-bold uppercase",
        className
      )}
    >
      {children}
    </span>
  );
}
