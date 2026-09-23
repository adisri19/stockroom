'use client';

import { useState, useEffect } from 'react';

/**
 * Generic debounce hook.
 * @param {any} value
 * @param {number} delay
 * @returns {any} debouncedValue
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
