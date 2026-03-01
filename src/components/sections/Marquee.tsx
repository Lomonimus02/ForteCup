"use client";

interface MarqueeProps {
  text: string;
}

export function Marquee({ text }: MarqueeProps) {
  // Split by "///" to get individual items
  const items = text
    .split("///")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `/// ${s}`);

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b-2 border-dark bg-accent py-4">
      <div className="animate-marquee flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mr-16 font-display text-2xl font-extrabold uppercase text-dark"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
