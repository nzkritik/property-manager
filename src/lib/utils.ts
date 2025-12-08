import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function calculateROI(
  currentValue: number,
  purchasePrice: number,
  totalExpenses: number
): number {
  const totalInvestment = purchasePrice + totalExpenses
  return ((currentValue - totalInvestment) / totalInvestment) * 100
}

export function calculateRentalYield(
  annualRent: number,
  propertyValue: number
): number {
  return (annualRent / propertyValue) * 100
}
