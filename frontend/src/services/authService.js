import apiClient from './apiClient';

/**
 * AUTH SERVICE
 * Handles login, registration, and logout operations.
 */
const authService = {
  /**
   * Login Request
   * @param {string} email 
   * @param {string} password 
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { 
        email, 
        password 
      });

      if (response.data.token) {
        // Store both as requested
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("AuthService Login Error:", error);
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = '/login';
  },

  /**
   * Get Current User
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;
