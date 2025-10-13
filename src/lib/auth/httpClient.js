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
      // Get token from multiple sources
      if (typeof window !== "undefined") {
        // Try SSO token first
        const ssoToken = localStorage.getItem("auth_token");
        if (ssoToken) {
          config.headers.Authorization = `Bearer ${ssoToken}`;
          console.log(
            "Adding SSO Authorization header to request:",
            config.url
          );
          return config;
        }

        // Fallback to existing auth store for transparency login
        try {
          const { useAuthStore } = require("./authStore");
          const token = useAuthStore.getState().accessToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(
              "Adding Transparency Authorization header to request:",
              config.url
            );
          } else {
            console.log("No token available for request:", config.url);
          }
        } catch (error) {
          // Auth store might not exist yet, that's okay
          console.log("Auth store not available, continuing without token");
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
          // Check which auth method is being used
          if (typeof window !== "undefined") {
            const ssoToken = localStorage.getItem("auth_token");

            // SSO/OIDC authentication - use OIDC JWT refresh
            if (ssoToken) {
              console.log("🔄 401 error - attempting OIDC JWT refresh...");

              const { refreshJWTToken } = require("./jwtUtils");
              const newTokenData = await refreshJWTToken();

              if (newTokenData) {
                console.log("✅ OIDC JWT refresh successful, retrying request");

                // Update auth store with new token
                const useAuthStore = require("@/stores/useAuthStore").default;
                const store = useAuthStore.getState();

                // Update store with new token data
                if (store.loginWithSSO && newTokenData.user) {
                  store.loginWithSSO(
                    newTokenData.token,
                    newTokenData.user,
                    newTokenData.expiry
                  );
                }

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newTokenData.token}`;
                return client(originalRequest);
              } else {
                console.error(
                  "❌ OIDC JWT refresh failed - user needs to re-login"
                );

                // Clear auth state
                const useAuthStore = require("@/stores/useAuthStore").default;
                useAuthStore.getState().logout();

                // Dispatch event for auth failure
                window.dispatchEvent(new CustomEvent("auth:token-expired"));

                return Promise.reject(new Error("Token refresh failed"));
              }
            }

            // Transparency authentication - use old refresh method
            const { useAuthStore } = require("./authStore");
            const store = useAuthStore.getState();
            const refreshToken = store.refreshToken;

            if (refreshToken) {
              console.log(
                "🔄 401 error - attempting transparency token refresh..."
              );

              // Attempt to refresh the token (transparency auth)
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
            console.error("❌ Token refresh failed:", refreshError);

            // Clear SSO auth
            const ssoToken = localStorage.getItem("auth_token");
            if (ssoToken) {
              const useAuthStore = require("@/stores/useAuthStore").default;
              useAuthStore.getState().logout();
            }

            // Clear transparency auth
            const { useAuthStore } = require("./authStore");
            useAuthStore.getState().clearAuth();
          }

          // Dispatch custom event for auth failure
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:token-expired"));
          }

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
  paymentTokens: "/presale/payment-tokens/",
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
 * API endpoints for ticketing system
 */
export const ticketEndpoints = {
  categories: "/tickets/categories/",
  tickets: "/tickets/tickets/",
  myTickets: "/tickets/my-tickets/",
  ticketDetails: (id) => `/tickets/tickets/${id}/`,
  ticketComments: (id) => `/tickets/tickets/${id}/comments/`,
  ticketAttachments: (id) => `/tickets/tickets/${id}/attachments/`,
  closeTicket: (id) => `/tickets/tickets/${id}/close/`,
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
