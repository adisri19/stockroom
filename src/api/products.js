import api from '../lib/axios';

/**
 * Fetch paginated products.
 * @param {Object} params { limit, skip }
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} { products, total, skip, limit }
 */
export async function getProducts({ limit = 10, skip = 0 } = {}, { signal } = {}) {
  const response = await api.get('/products', {
    params: { limit, skip },
    signal,
  });
  return response.data;
}

/**
 * Search products by query string.
 * @param {Object} params { q, limit, skip }
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} { products, total, skip, limit }
 */
export async function searchProducts({ q = '', limit = 10, skip = 0 } = {}, { signal } = {}) {
  const response = await api.get('/products/search', {
    params: { q, limit, skip },
    signal,
  });
  return response.data;
}

/**
 * Fetch products filtered by category.
 * @param {Object} params { category, limit, skip }
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} { products, total, skip, limit }
 */
export async function getProductsByCategory(
  { category, limit = 10, skip = 0 } = {},
  { signal } = {}
) {
  const response = await api.get(`/products/category/${encodeURIComponent(category)}`, {
    params: { limit, skip },
    signal,
  });
  return response.data;
}

/**
 * Fetch a single product by ID.
 * @param {number|string} id
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} Product details
 */
export async function getProduct(id, { signal } = {}) {
  const response = await api.get(`/products/${id}`, {
    signal,
  });
  return response.data;
}

/**
 * Add a new product (faked persistence by DummyJSON).
 * @param {Object} data
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} Created product
 */
export async function addProduct(data, { signal } = {}) {
  const response = await api.post('/products/add', data, {
    signal,
  });
  return response.data;
}

/**
 * Update an existing product.
 * @param {number|string} id
 * @param {Object} data
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(id, data, { signal } = {}) {
  const response = await api.put(`/products/${id}`, data, {
    signal,
  });
  return response.data;
}

/**
 * Delete a product.
 * @param {number|string} id
 * @param {Object} [options] { signal }
 * @returns {Promise<Object>} Deleted product details
 */
export async function deleteProduct(id, { signal } = {}) {
  const response = await api.delete(`/products/${id}`, {
    signal,
  });
  return response.data;
}
