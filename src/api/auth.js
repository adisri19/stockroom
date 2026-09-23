import api from '../lib/axios';

/**
 * Authenticates user credentials against the DummyJSON auth API.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} API response data with token and user details
 */
export async function login(username, password) {
  const response = await api.post('/auth/login', {
    username,
    password,
  });
  return response.data;
}

/**
 * Logs out the user. DummyJSON is stateless JWT, so local teardown handles state.
 * @returns {Promise<Object>}
 */
export async function logout() {
  return Promise.resolve({ success: true });
}
