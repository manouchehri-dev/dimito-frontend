import { useDashboardSummary } from "@/lib/api";

export function useDashboardData(walletAddress) {
  const {
    data: dashboardData,
    isLoading: loading,
    error,
    refetch,
  } = useDashboardSummary(walletAddress, {
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
  });

  return {
    dashboardData,
    loading,
    error: error?.message || error,
    refetch,
  };
}

// Mock data for development/demo purposes matching new API structure
function getMockDashboardData() {
  return {
    user_info: {
      id: 18,
      address: "0xF0CAdd1b3aEb569d4A4bDe9056FD8CA4826041FE",
      first_name: "John",
      last_name: "Crypto",
      email: "john.crypto@example.com",
      is_verified: true,
      is_active: true,
      country: "United States",
      city: "New York"
    },
    recent_purchases: [
      {
        id: 161,
        purchase_id: 1012,
        amount_in_payment_token: "1730.570716751735000000",
        amount_in_presale_token: "21572.515095586545975715",
        created_at: "2025-10-11T18:43:42.030663Z",
        is_verified: true,
        presale_info: {
          id: 57,
          presale_id: 101,
          start_time: "2025-09-17T09:44:36.030663Z",
          end_time: "2025-10-20T09:44:36.030663Z",
          is_active: true,
          price_per_token: "0.080221091934977350"
        },
        token_info: {
          id: 47,
          name: "Turner, Munoz and Hernandez Mining Token",
          symbol: "PMT699",
          image: null
        },
        payment_token_info: {
          id: 15,
          name: "USD Token",
          symbol: "USD"
        }
      },
      {
        id: 160,
        purchase_id: 1011,
        amount_in_payment_token: "1563.626294067147000000",
        amount_in_presale_token: "19491.461115170726597443",
        created_at: "2025-09-29T20:37:12.030663Z",
        is_verified: true,
        presale_info: {
          id: 57,
          presale_id: 101,
          start_time: "2025-09-17T09:44:36.030663Z",
          end_time: "2025-10-20T09:44:36.030663Z",
          is_active: true,
          price_per_token: "0.080221091934977350"
        },
        token_info: {
          id: 47,
          name: "Turner, Munoz and Hernandez Mining Token",
          symbol: "PMT699",
          image: null
        },
        payment_token_info: {
          id: 15,
          name: "USD Token",
          symbol: "USD"
        }
      }
    ],
    participated_presales: [
      {
        id: 61,
        presale_id: 400,
        start_time: "2025-09-19T09:44:36.030663Z",
        end_time: "2025-10-03T09:44:36.030663Z",
        start_unix_timestamp: 1758275076,
        end_unix_timestamp: 1759484676,
        price_per_token: "0.029792806352736404",
        total_supply: "2775397.000000000000000000",
        total_sold: "1635069.000000000000000000",
        is_active: true,
        description: "Wright Ltd Mining Token presale offering with competitive rates.",
        total_purchases: 3,
        mine_token: {
          id: 50,
          name: "Wright Ltd Mining Token",
          symbol: "SMT116",
          image: null
        },
        payment_token: {
          id: 15,
          name: "USD Token",
          symbol: "USD"
        },
        user_participation: {
          total_invested: "3148.003400205350300000",
          total_tokens_purchased: "105663.204833210117637730",
          purchase_count: 3,
          verified_purchases: 3,
          first_purchase_date: "2025-09-23T23:46:04.030663Z",
          last_purchase_date: "2025-09-29T06:46:04.030663Z"
        }
      }
    ],
    statistics: {
      purchase_summary: {
        total_purchases: 20,
        verified_purchases: 16,
        verification_rate: 80.0,
        total_invested: "19368.622346870428240000",
        total_tokens_acquired: "367150.157128899977549348",
        average_purchase_amount: "968.43"
      },
      participation_summary: {
        presales_participated: 5,
        active_participations: 2,
        unique_tokens_purchased: 4
      },
      recent_activity: {
        purchases_last_30_days: 16,
        investment_last_30_days: "15848.750247959655500000"
      },
      account_status: {
        is_verified: true,
        is_active: true,
        registration_date: "2025-09-21T09:19:14.106706Z"
      }
    }
  };
}
