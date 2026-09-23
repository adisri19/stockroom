import api from '../lib/axios';

/**
 * Fetch product categories from DummyJSON.
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<Array>} Array of categories
 */
export async function getCategories({ signal } = {}) {
  const response = await api.get('/products/categories', { signal });
  return response.data;
}
