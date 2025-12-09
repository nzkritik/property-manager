const DATE_FORMAT = process.env.NEXT_PUBLIC_DATE_FORMAT || 'dd/MM/yyyy';
const LOCALE = process.env.NEXT_PUBLIC_LOCALE || 'en-NZ';
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'NZD';

export const getDateFormat = () => DATE_FORMAT;
export const getLocale = () => LOCALE;
export const getCurrency = () => CURRENCY;

/**
 * Format a date string to display format based on env settings
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (DATE_FORMAT === 'dd/MM/yyyy') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else if (DATE_FORMAT === 'MM/dd/yyyy') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } else if (DATE_FORMAT === 'yyyy-MM-dd') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  
  // Default fallback
  return date.toLocaleDateString(LOCALE);
};

/**
 * Convert date to yyyy-MM-dd format for HTML date inputs
 */
export const convertToInputDate = (dateString: string): string => {
  return dateString.split('T')[0];
};

/**
 * Format currency based on env settings
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
