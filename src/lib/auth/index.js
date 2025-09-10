// Authentication service and utilities
export { authService } from "./authService";
export { tokenStorage } from "./tokenStorage";
export { httpClient, apiRequest, authEndpoints } from "./httpClient";

// Zustand store and hooks
export {
  useAuthStore,
  useAuthUser,
  useAuthTokens,
  useAuthStatus,
  useAuthActions,
} from "./authStore";

// React Query hooks
export {
  useLogin,
  useLogout,
  useRefreshToken,
  useCurrentUser,
  useVerifyToken,
  useAuth,
  authKeys,
} from "./authQueries";

// Types and interfaces (for TypeScript projects)
export const AuthTypes = {
  LoginCredentials: null, // Will be properly typed in TypeScript
  AuthResponse: null,
  AuthError: null,
  AuthState: null,
};
