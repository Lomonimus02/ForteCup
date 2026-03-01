import { type ClassValue, clsx } from "clsx";

/** Minimal clsx-like utility (no external dep needed) */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

/** Format price in Russian Roubles */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
