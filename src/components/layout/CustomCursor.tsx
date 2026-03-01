"use client";

import { useCustomCursor } from "@/hooks/useCustomCursor";

export function CustomCursor() {
  const { cursorRef } = useCustomCursor();

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999] h-5 w-5 rounded-full bg-dark"
      style={{
        transform: "translate(-50%, -50%)",
        transition: "transform 0.1s ease, background 0.15s ease",
        mixBlendMode: "difference",
      }}
    />
  );
}
