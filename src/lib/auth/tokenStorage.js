/**
 * Token storage utility that integrates with Zustand store
 * Provides backward compatibility while leveraging Zustand for state management
 */

class TokenStorage {
  /**
   * Check if localStorage is available
   * @returns {boolean} localStorage availability
   */
  isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set access token in storage (delegates to Zustand store)
   * @param {string} token - JWT access token
   */
  setAccessToken(token) {
    // This will be handled by Zustand store persistence
    // Keeping for backward compatibility
  }

  /**
   * Get access token from storage (delegates to Zustand store)
   * @returns {string|null} JWT access token or null
   */
  getAccessToken() {
    // Get from Zustand store if available, fallback to direct access
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      return useAuthStore.getState().accessToken;
    }
    return null;
  }

  /**
   * Set refresh token in storage (delegates to Zustand store)
   * @param {string} token - JWT refresh token
   */
  setRefreshToken(token) {
    // This will be handled by Zustand store persistence
    // Keeping for backward compatibility
  }

  /**
   * Get refresh token from storage (delegates to Zustand store)
   * @returns {string|null} JWT refresh token or null
   */
  getRefreshToken() {
    // Get from Zustand store if available
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      return useAuthStore.getState().refreshToken;
    }
    return null;
  }

  /**
   * Set both access and refresh tokens (delegates to Zustand store)
   * @param {string} accessToken - JWT access token
   * @param {string} refreshToken - JWT refresh token
   */
  setTokens(accessToken, refreshToken) {
    // This will be handled by Zustand store when setAuth is called
    // Keeping for backward compatibility
  }

  /**
   * Set user data in storage (delegates to Zustand store)
   * @param {Object} userData - User information object
   */
  setUser(userData) {
    // This will be handled by Zustand store persistence
    // Keeping for backward compatibility
  }

  /**
   * Get user data from storage (delegates to Zustand store)
   * @returns {Object|null} User data object or null
   */
  getUser() {
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      return useAuthStore.getState().user;
    }
    return null;
  }

  /**
   * Clear access token from storage (delegates to Zustand store)
   */
  clearAccessToken() {
    // Handled by Zustand store clearAuth action
  }

  /**
   * Clear refresh token from storage (delegates to Zustand store)
   */
  clearRefreshToken() {
    // Handled by Zustand store clearAuth action
  }

  /**
   * Clear user data from storage (delegates to Zustand store)
   */
  clearUser() {
    // Handled by Zustand store clearAuth action
  }

  /**
   * Clear all authentication data from storage (delegates to Zustand store)
   */
  clearTokens() {
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      useAuthStore.getState().clearAuth();
    }
  }

  /**
   * Check if tokens exist in storage (delegates to Zustand store)
   * @returns {boolean} True if both access and refresh tokens exist
   */
  hasTokens() {
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      const state = useAuthStore.getState();
      return !!(state.accessToken && state.refreshToken);
    }
    return false;
  }

  /**
   * Get all stored authentication data (delegates to Zustand store)
   * @returns {Object} Object containing tokens and user data
   */
  getAllAuthData() {
    if (typeof window !== "undefined") {
      const { useAuthStore } = require("./authStore");
      const state = useAuthStore.getState();
      return {
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      };
    }
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }
}

export const tokenStorage = new TokenStorage();
