import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      isAuthenticated: false,
      user: null,
      token: null,
      authMethod: null, // 'sso', 'transparency', 'wallet'

      // JWT Token expiry management (CRITICAL for proper token handling)
      jwtExp: null, // Unix timestamp - when the JWT token expires
      jwtIat: null, // Unix timestamp - when the JWT token was issued
      expiresIn: null, // Seconds until expiration (for reference)

      // Login actions
      loginWithSSO: (token, userData, expiryData = {}) => {
        // Store token and user data in localStorage for persistence
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(userData));

        // Store JWT expiry timestamp separately (CRITICAL - don't decode JWT every time!)
        if (expiryData.jwt_exp) {
          localStorage.setItem("jwt_exp", expiryData.jwt_exp.toString());
          localStorage.setItem("jwt_iat", expiryData.jwt_iat?.toString() || "");
          console.log("✅ Stored JWT expiry:", {
            exp: expiryData.jwt_exp,
            expiresAt: new Date(expiryData.jwt_exp * 1000).toISOString(),
            expiresIn: expiryData.expires_in,
          });
        } else {
          // Fallback: decode JWT to get expiry (not recommended but works)
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            localStorage.setItem("jwt_exp", payload.exp.toString());
            localStorage.setItem("jwt_iat", payload.iat?.toString() || "");
            console.warn(
              "⚠️ Had to decode JWT for expiry - backend should provide this"
            );
          } catch (error) {
            console.error("❌ Failed to get JWT expiry:", error);
          }
        }

        set({
          isAuthenticated: true,
          user: {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            phoneNumber: userData.phone_number || null,
          },
          token: token,
          authMethod: "sso",
          jwtExp: expiryData.jwt_exp || null,
          jwtIat: expiryData.jwt_iat || null,
          expiresIn: expiryData.expires_in || null,
        });
      },

      loginWithTransparency: (userData) => {
        set({
          isAuthenticated: true,
          user: userData,
          token: null, // Transparency uses session-based auth
          authMethod: "transparency",
        });
      },

      // Logout action
      logout: () => {
        // Clear localStorage (including JWT expiry data)
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("jwt_exp");
        localStorage.removeItem("jwt_iat");

        set({
          isAuthenticated: false,
          user: null,
          token: null,
          authMethod: null,
          jwtExp: null,
          jwtIat: null,
          expiresIn: null,
        });
      },

      // Initialize auth from stored token
      initializeAuth: () => {
        const token = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");
        const jwtExp = localStorage.getItem("jwt_exp");

        if (token && storedUser) {
          try {
            // Use stored expiry timestamp (BEST PRACTICE - no JWT decoding needed!)
            let exp;
            if (jwtExp) {
              exp = parseInt(jwtExp);
              console.log("✅ Using stored JWT expiry timestamp:", exp);
            } else {
              // Fallback: decode JWT token to check expiration
              const payload = JSON.parse(atob(token.split(".")[1]));
              exp = payload.exp;
              console.warn("⚠️ No stored expiry, decoded JWT instead");
            }

            const now = Math.floor(Date.now() / 1000); // Current Unix timestamp

            // Check if token is expired
            if (exp > now) {
              const timeLeft = exp - now;
              console.log(
                `🔐 Token valid for ${Math.floor(timeLeft / 60)} minutes`
              );

              // Parse stored user data (this includes phone_number)
              const userData = JSON.parse(storedUser);
              const jwtIat = localStorage.getItem("jwt_iat");

              set({
                isAuthenticated: true,
                user: {
                  id: userData.id,
                  username: userData.username || "",
                  email: userData.email || "",
                  firstName: userData.first_name || "",
                  lastName: userData.last_name || "",
                  phoneNumber: userData.phone_number || null,
                },
                token: token,
                authMethod: "sso",
                jwtExp: exp,
                jwtIat: jwtIat ? parseInt(jwtIat) : null,
                expiresIn: timeLeft,
              });
            } else {
              // Token expired, clear everything
              console.log("❌ Token expired, clearing auth state");
              localStorage.removeItem("auth_token");
              localStorage.removeItem("auth_user");
              localStorage.removeItem("jwt_exp");
              localStorage.removeItem("jwt_iat");
              get().logout();
            }
          } catch (error) {
            console.error("Error parsing auth token:", error);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("jwt_exp");
            localStorage.removeItem("jwt_iat");
            get().logout();
          }
        }
      },

      // Check if user has specific auth method
      hasAuthMethod: (method) => {
        return get().authMethod === method;
      },

      // Get authorization header for API calls
      getAuthHeader: () => {
        const { token, authMethod } = get();
        if (authMethod === "sso" && token) {
          return `Bearer ${token}`;
        }
        return null;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        authMethod: state.authMethod,
        // Don't persist token in Zustand, use localStorage directly
      }),
    }
  )
);

export default useAuthStore;
