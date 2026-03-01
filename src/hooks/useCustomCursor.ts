"use client";

import { useEffect, useCallback, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "button, a, .product-card, .bento-item, [role='button'], input, textarea, select, label";

export function useCustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const isHovering = useRef(false);

  const grow = useCallback(() => {
    if (!cursorRef.current || isHovering.current) return;
    isHovering.current = true;
    cursorRef.current.style.transform = "translate(-50%, -50%) scale(3)";
    cursorRef.current.style.background = "var(--color-accent)";
    cursorRef.current.style.mixBlendMode = "normal";
  }, []);

  const shrink = useCallback(() => {
    if (!cursorRef.current || !isHovering.current) return;
    isHovering.current = false;
    cursorRef.current.style.transform = "translate(-50%, -50%) scale(1)";
    cursorRef.current.style.background = "var(--color-dark)";
    cursorRef.current.style.mixBlendMode = "difference";
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;

      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        grow();
      } else {
        shrink();
      }
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [grow, shrink]);

  return { cursorRef };
}
