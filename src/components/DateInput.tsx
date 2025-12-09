'use client';

import { useState, useEffect } from 'react';
import { getDateFormat } from '@/lib/dateUtils';

interface DateInputProps {
  value: string; // yyyy-MM-dd format
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function DateInput({ value, onChange, required, className }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const dateFormat = getDateFormat();

  useEffect(() => {
    if (value) {
      setDisplayValue(formatDateForDisplay(value));
    }
  }, [value]);

  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    
    if (dateFormat === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`;
    } else if (dateFormat === 'MM/dd/yyyy') {
      return `${month}/${day}/${year}`;
    }
    return isoDate;
  };

  const parseDisplayDate = (display: string): string => {
    if (!display) return '';
    const parts = display.replace(/[^\d]/g, '');
    
    if (parts.length !== 8) return value; // Invalid format, return original
    
    let year, month, day;
    
    if (dateFormat === 'dd/MM/yyyy') {
      day = parts.substring(0, 2);
      month = parts.substring(2, 4);
      year = parts.substring(4, 8);
    } else if (dateFormat === 'MM/dd/yyyy') {
      month = parts.substring(0, 2);
      day = parts.substring(2, 4);
      year = parts.substring(4, 8);
    } else {
      return value;
    }
    
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    
    // Try to parse if we have enough characters
    if (rawValue.replace(/[^\d]/g, '').length === 8) {
      const isoDate = parseDisplayDate(rawValue);
      onChange(isoDate);
    }
  };

  const handleBlur = () => {
    // Format on blur
    if (displayValue) {
      const isoDate = parseDisplayDate(displayValue);
      const formatted = formatDateForDisplay(isoDate);
      setDisplayValue(formatted);
      onChange(isoDate);
    }
  };

  const placeholder = dateFormat === 'dd/MM/yyyy' ? 'dd/mm/yyyy' : 
                      dateFormat === 'MM/dd/yyyy' ? 'mm/dd/yyyy' : 
                      'yyyy-mm-dd';

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      className={className}
      maxLength={10}
    />
  );
}
