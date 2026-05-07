import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatINR = (amount: number) => {
  const safe = isNaN(amount) || amount == null ? 0 : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(safe);
};

export const getGridCols = (count: number) => {
  if (count === 4) return "grid-cols-2";
  if (count === 2) return "grid-cols-2";
  if (count === 1) return "grid-cols-1";
  return "grid-cols-3";
};
