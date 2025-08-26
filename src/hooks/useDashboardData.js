import { useApiQuery } from "@/lib/api";

export function useDashboardData(walletAddress) {
  const {
    data: dashboardData,
    isLoading: loading,
    error,
    refetch,
  } = useApiQuery(
    ["dashboard", walletAddress],
    `/presale/user/${walletAddress}/dashboard/`,
    {
      enabled: !!walletAddress, // Only run query if walletAddress exists
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors, but retry on 5xx and network errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      select: (data) => {
        // Transform the API response if needed
        if (data?.success) {
          return data.data;
        }
        // For development, return mock data on API failure
        if (process.env.NODE_ENV === "development") {
          console.warn("API response failed, using mock data:", data);
          return getMockDashboardData();
        }
        throw new Error(data?.message || "Failed to fetch dashboard data");
      },
      // Fallback to mock data in development when query fails
      placeholderData:
        process.env.NODE_ENV === "development"
          ? getMockDashboardData()
          : undefined,
    }
  );

  return {
    dashboardData,
    loading,
    error: error?.message || error,
    refetch,
  };
}

// Mock data for development/demo purposes
function getMockDashboardData() {
  return {
    user_address: "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
    overview: {
      total_presales_participated: 3,
      total_purchases: 6,
      verified_purchases: 5,
      total_spent: 2850.5,
      verification_rate: 83.3,
      tokens_held: 3,
    },
    token_holdings_summary: [
      {
        token: {
          token_name: "Bitcoin Mining Token",
          token_symbol: "BMT",
          token_address: "0x1234567890abcdef1234567890abcdef12345678",
        },
        total_amount: 1500.5,
        total_spent: 750.25,
      },
      {
        token: {
          token_name: "Ethereum Mining Token",
          token_symbol: "EMT",
          token_address: "0x2345678901bcdef12345678901bcdef123456789",
        },
        total_amount: 1200.0,
        total_spent: 900.0,
      },
      {
        token: {
          token_name: "Solana Mining Token",
          token_symbol: "SMT",
          token_address: "0x3456789012cdef123456789012cdef1234567890",
        },
        total_amount: 800.0,
        total_spent: 1200.25,
      },
    ],
    recent_activity: [
      {
        presale_id: 6,
        token_symbol: "SMT",
        amount_purchased: 800.0,
        amount_spent: 1200.25,
        is_verified: true,
        purchase_date: "2024-01-20T14:45:00Z",
      },
      {
        presale_id: 2,
        token_symbol: "BMT",
        amount_purchased: 500.0,
        amount_spent: 250.0,
        is_verified: true,
        purchase_date: "2024-01-15T10:30:00Z",
      },
      {
        presale_id: 4,
        token_symbol: "EMT",
        amount_purchased: 1200.0,
        amount_spent: 900.0,
        is_verified: false,
        purchase_date: "2024-01-12T08:15:00Z",
      },
    ],
  };
}
