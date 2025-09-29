import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      isAuthenticated: false,
      user: null,
      token: null,
      authMethod: null, // 'sso', 'transparency', 'wallet'
      
      // Login actions
      loginWithSSO: (token, userData) => {
        // Store token and user data in localStorage for persistence
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        set({
          isAuthenticated: true,
          user: {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            phoneNumber: userData.phone_number || null
          },
          token: token,
          authMethod: 'sso'
        });
      },
      
      loginWithTransparency: (userData) => {
        set({
          isAuthenticated: true,
          user: userData,
          token: null, // Transparency uses session-based auth
          authMethod: 'transparency'
        });
      },
      
      // Logout action
      logout: () => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          authMethod: null
        });
      },
      
      // Initialize auth from stored token
      initializeAuth: () => {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (token && storedUser) {
          try {
            // Decode JWT token to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Check if token is expired
            if (payload.exp * 1000 > Date.now()) {
              // Parse stored user data (this includes phone_number)
              const userData = JSON.parse(storedUser);
              
              set({
                isAuthenticated: true,
                user: {
                  id: userData.id,
                  username: userData.username || '',
                  email: userData.email || '',
                  firstName: userData.first_name || '',
                  lastName: userData.last_name || '',
                  phoneNumber: userData.phone_number || null
                },
                token: token,
                authMethod: 'sso'
              });
            } else {
              // Token expired, clear everything
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              get().logout();
            }
          } catch (error) {
            console.error('Error parsing auth token:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
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
        if (authMethod === 'sso' && token) {
          return `Bearer ${token}`;
        }
        return null;
      }
    }),
    {
      name: 'auth-storage',
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
