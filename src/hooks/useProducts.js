'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
} from '../api/products';

/**
 * Custom hook to fetch and manage products with pagination, search, category filter, and client sorting.
 * Implements strict AbortController race condition prevention.
 */
export default function useProducts() {
  const searchParams = useSearchParams();

  // Parse state from URL search parameters with safe fallback defaults
  const rawPage = parseInt(searchParams.get('page'), 10);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawLimit = parseInt(searchParams.get('limit'), 10);
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const sortBy = searchParams.get('sortBy') || '';
  const order = searchParams.get('order') || 'asc';

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const activeControllerRef = useRef(null);

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Abort previous in-flight request if any exists
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    // Create a new AbortController for this fetch
    const controller = new AbortController();
    activeControllerRef.current = controller;

    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const skip = (page - 1) * limit;
        let data;

        // Mutual exclusion logic: category takes precedence, else q, else base list
        if (category) {
          data = await getProductsByCategory(
            { category, limit, skip },
            { signal: controller.signal }
          );
        } else if (q) {
          data = await searchProducts(
            { q, limit, skip },
            { signal: controller.signal }
          );
        } else {
          data = await getProducts(
            { limit, skip },
            { signal: controller.signal }
          );
        }

        // If this request was cancelled during execution, bail out immediately
        if (controller.signal.aborted) {
          return;
        }

        let resultList = Array.isArray(data?.products) ? [...data.products] : [];

        // Client-side sorting (price, rating, title)
        if (sortBy) {
          resultList.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'title') {
              aVal = (aVal || '').toLowerCase();
              bVal = (bVal || '').toLowerCase();
              if (aVal < bVal) return order === 'desc' ? 1 : -1;
              if (aVal > bVal) return order === 'desc' ? -1 : 1;
              return 0;
            }

            aVal = Number(aVal) || 0;
            bVal = Number(bVal) || 0;
            return order === 'desc' ? bVal - aVal : aVal - bVal;
          });
        }

        setProducts(resultList);
        setTotal(typeof data?.total === 'number' ? data.total : resultList.length);
        setLoading(false);
      } catch (err) {
        // Strict race condition check: if canceled/aborted, ignore silently
        if (
          err.name === 'CanceledError' ||
          err.code === 'ERR_CANCELED' ||
          err.name === 'AbortError' ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error('Products fetch error:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load products. Please check your connection.'
        );
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      // Abort controller when dependencies change or component unmounts
      controller.abort();
    };
  }, [page, limit, q, category, sortBy, order, fetchTrigger]);

  return {
    products,
    setProducts,
    total,
    setTotal,
    loading,
    error,
    refetch,
    page,
    limit,
    q,
    category,
    sortBy,
    order,
  };
}
