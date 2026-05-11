import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge TailwindCSS class names safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in VND */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/** Format short price label (e.g., 1.2M) */
export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M₫`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K₫`;
  return `${price}₫`;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Slugify a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Generate star array for rating */
export function getStars(rating: number): ("full" | "half" | "empty")[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return "full";
    if (rating >= i + 0.5) return "half";
    return "empty";
  });
}

/** Get image fallback URL */
export function getImageUrl(url: string | undefined): string {
  if (!url) return "https://placehold.co/400x400/fef3c7/92400e?text=PawMart";
  return url;
}

/** Parse JSON from localStorage without crashing the app on stale values */
export function parseJsonSafe<T>(value: string | null, fallback: T): T {
  if (!value || value === "undefined" || value === "null") {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Debounce utility */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
