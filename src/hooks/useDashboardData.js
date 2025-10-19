import { useDashboardSummary } from "@/lib/api";
import useAuthStore from "@/stores/useAuthStore";

export function useDashboardData(walletAddress, tab = 'wallet') {
  const { token, authMethod, isAuthenticated } = useAuthStore();

  // Get auth token for SSO requests
  const authToken = (tab === 'sso' && authMethod === 'sso') ? token : null;

  // For SSO tab, ensure we have valid auth data before making requests
  const isEnabled = tab === 'sso'
    ? (!!walletAddress && !!authToken && isAuthenticated && authMethod === 'sso')
    : !!walletAddress;

  const {
    data: dashboardData,
    isLoading: loading,
    error,
    refetch,
  } = useDashboardSummary(walletAddress, tab, authToken, {
    enabled: isEnabled,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, but retry on 5xx and network errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    select: (data) => {
      // Handle new tab-based API response structure
      if (data?.mode === 'tab_based') {
        return data;
      }
      // Legacy support for old API response
      if (data?.success) {
        return data.data;
      }
      throw new Error(data?.message || "Failed to fetch dashboard data");
    },

  });

  return {
    dashboardData,
    loading,
    error: error?.message || error,
    refetch,
  };
}