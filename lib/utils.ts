import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a decimal value to a specified number of decimal places
 * @param value - The value to format (string or number)
 * @param decimalPlaces - Number of decimal places to format to (default: 2)
 * @returns Formatted string with the specified number of decimal places
 */
export function formatDecimalValue(value: string | number, decimalPlaces = 2): string {
  // Handle empty values
  if (value === null || value === undefined || value === "") {
    return ""
  }

  // Convert to number
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return ""
  }

  // Format to the specified number of decimal places
  return numValue.toFixed(decimalPlaces)
}

