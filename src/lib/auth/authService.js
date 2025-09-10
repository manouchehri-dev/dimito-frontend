import { apiRequest, authEndpoints } from "./httpClient";

class AuthService {
  /**
   * Authenticate user with username and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Authentication response with tokens and user data
   */
  async login(credentials) {
    try {
      const data = await apiRequest("POST", authEndpoints.login, credentials);
      // Return data - Zustand store will handle storage via the login action
      return data;
    } catch (error) {
      if (error.status === 400 && error.data?.non_field_errors) {
        throw new Error(error.data.non_field_errors[0]);
      }

      throw new Error(error.message || "Login failed. Please try again.");
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<string>} New access token
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const data = await apiRequest("POST", authEndpoints.refresh, {
        refresh: refreshToken,
      });

      const { access } = data;
      return access;
    } catch (error) {
      throw new Error("Token refresh failed");
    }
  }

  /**
   * Logout user (token clearing handled by Zustand store)
   */
  logout() {
    // Token clearing is handled by Zustand store
    // This method exists for consistency
  }

  /**
   * Check if user is currently authenticated (delegates to Zustand store)
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      return useAuthStore.getState().isAuthenticated;
    }
    return false;
  }

  /**
   * Get current user data (delegates to Zustand store)
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser() {
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      return useAuthStore.getState().user;
    }
    return null;
  }

  /**
   * Verify token validity
   * @param {string} token - Access token to verify
   * @returns {Promise<boolean>} Token validity status
   */
  async verifyToken(token) {
    try {
      if (!token) return false;

      await apiRequest("POST", authEndpoints.verify, { token });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
