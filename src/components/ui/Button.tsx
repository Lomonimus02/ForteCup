"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: "brutal" | "outline" | "icon";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "brutal",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-display font-extrabold uppercase transition-colors relative overflow-hidden";

  const variants: Record<string, string> = {
    brutal:
      "bg-dark text-accent border-none rounded-full hover:bg-accent hover:text-dark",
    outline:
      "bg-transparent text-dark border-2 border-dark rounded-full hover:bg-dark hover:text-accent",
    icon: "w-[45px] h-[45px] border-2 border-dark rounded-full hover:bg-dark hover:text-accent",
  };

  const sizes: Record<string, string> = {
    sm: "px-6 py-3 text-xs",
    md: "px-10 py-5 text-sm",
    lg: "px-14 py-6 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        base,
        variants[variant],
        variant !== "icon" && sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
