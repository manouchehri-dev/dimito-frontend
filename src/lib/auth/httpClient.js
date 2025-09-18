import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
/**
 * Create HTTP client with authentication and error handling
 * Integrates with React Query for optimal caching and state management
 */
export const createHttpClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to attach authentication token
  client.interceptors.request.use(
    (config) => {
      // Get token from Zustand store
      if (typeof window !== "undefined") {
        const { useAuthStore } = require("./authStore");
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("Adding Authorization header to request:", config.url);
        } else {
          console.log("No token available for request:", config.url);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized responses
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get refresh token from Zustand store
          if (typeof window !== "undefined") {
            const { useAuthStore } = require("./authStore");
            const store = useAuthStore.getState();
            const refreshToken = store.refreshToken;

            if (refreshToken) {
              // Attempt to refresh the token
              const refreshResponse = await axios.post(
                `${API_BASE_URL}/auth/token/refresh/`,
                {
                  refresh: refreshToken,
                }
              );

              const { access } = refreshResponse.data;

              // Update token in Zustand store
              store.setAccessToken(access);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return client(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          if (typeof window !== "undefined") {
            const { useAuthStore } = require("./authStore");
            useAuthStore.getState().clearAuth();
          }

          // Dispatch custom event for auth failure
          window.dispatchEvent(new CustomEvent("auth:token-expired"));

          return Promise.reject(refreshError);
        }
      }

      // Handle different error types
      if (error.code === "ECONNABORTED") {
        error.message = "Request timeout. Please try again.";
      } else if (!error.response) {
        error.message = "Network error. Please check your connection.";
      } else if (error.response.status >= 500) {
        error.message = "Server error. Please try again later.";
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create default HTTP client instance
export const httpClient = createHttpClient();

/**
 * API endpoints for authentication
 */
export const authEndpoints = {
  login: "/auth/login/",
  refresh: "/auth/token/refresh/",
  verify: "/auth/token/verify/",
  logout: "/auth/logout/",
};

/**
 * API endpoints for presale operations
 */
export const presaleEndpoints = {
  createFromToken: "/presale/create-from-token/",
  list: "/presale/",
  presales: "/presale/presales/",
  detail: (id) => `/presale/${id}/`,
  update: (id) => `/presale/${id}/`,
  delete: (id) => `/presale/${id}/`,
};

/**
 * API endpoints for token operations
 */
export const tokenEndpoints = {
  details: (id) => `/presale/tokens/${id}/`,
};

/**
 * Generic API request function with error handling
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 * @param {Object} config - Additional axios config
 * @returns {Promise} API response
 */
export const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    const response = await httpClient({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    // Transform error for consistent handling
    const apiError = {
      message: error.message || "An error occurred",
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    };

    throw apiError;
  }
};
