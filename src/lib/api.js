"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

// API configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.dimito.ir";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Generic API query hook
export function useApiQuery(queryKey, endpoint, options = {}) {
  const fetchData = async () => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey,
    queryFn: fetchData,
    ...options,
  });
}

// React Query mutation hook
export function useApiMutation(method = "post", endpoint, options = {}) {
  const mutationFn = async (data) => {
    try {
      const response = await api[method](endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      throw error;
    }
  };

  return useMutation({
    mutationFn,
    ...options,
  });
}

// Generic API mutation function for direct use
export async function apiMutation(method, endpoint, data) {
  try {
    const response = await api[method](endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    throw error;
  }
}

// Wallet authentication specific hook
export function useWalletAuth() {
  return useApiMutation("post", "/auth/wallet/", {
    // Prevent retry on client-side errors to avoid duplicate registrations
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (likely duplicate registration)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Only retry once for server errors
      return failureCount < 1;
    },
    onSuccess: (data) => {
      console.log("Wallet authentication successful:", data);
    },
    onError: (error) => {
      console.error("Wallet authentication failed:", error);
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        console.warn("Wallet may already be registered");
      }
    },
  });
}

// Listing submission hook
export function useCreateListing() {
  return useApiMutation("post", "/presale/listings/create/", {
    // Don't retry form submissions to avoid duplicates
    retry: false,
    onSuccess: (data) => {
      console.log("Listing created successfully:", data);
    },
    onError: (error) => {
      console.error("Listing creation failed:", error);
    },
  });
}

// Enhanced API mutation for FormData (file uploads)
export function useApiMutationFormData(
  method = "post",
  endpoint,
  options = {}
) {
  const mutationFn = async (formData) => {
    try {
      // Create axios config for FormData
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await api[method](endpoint, formData, config);
      return response.data;
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      throw error;
    }
  };

  return useMutation({
    mutationFn,
    ...options,
  });
}

// Presales API hook
export function usePresales(options = {}) {
  return useApiQuery(["presales"], "/presale/presales/", {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Token Details Hook
export function useTokenDetails(tokenId, options = {}) {
  return useApiQuery(["tokenDetails", tokenId], `/presale/tokens/${tokenId}/`, {
    enabled: !!tokenId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Presale Details Hook
export function usePresaleDetails(presaleId, options = {}) {
  return useApiQuery(["presaleDetails", presaleId], `/presale/presales/${presaleId}/`, {
    enabled: !!presaleId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for buy page)
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    ...options,
  });
}

// Dashboard Summary Hook - Tab-based API structure
export function useDashboardSummary(walletAddress, tab = 'wallet', authToken = null, options = {}) {
  const fetchData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add auth header for SSO tab
      if (tab === 'sso' && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await api.get(
        `/dashboard/?wallet_address=${walletAddress}&tab=${tab}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching dashboard data:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["dashboardSummary", walletAddress, tab],
    queryFn: fetchData,
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time data
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Paginated Purchases Hook - Tab-based
export function usePaginatedPurchases(walletAddress, page = 1, tab = 'wallet', authToken = null, options = {}) {
  const fetchData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add auth header for SSO tab
      if (tab === 'sso' && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await api.get(
        `/dashboard/purchases/?wallet_address=${walletAddress}&page=${page}&tab=${tab}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchases:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["paginatedPurchases", walletAddress, page, tab],
    queryFn: fetchData,
    enabled: !!walletAddress,
    staleTime: 1 * 60 * 1000, // 1 minute for recent data
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true, // Keep previous page data while loading new page
    ...options,
  });
}

// Paginated Presales Hook - Tab-based
export function usePaginatedPresales(walletAddress, page = 1, tab = 'wallet', authToken = null, options = {}) {
  const fetchData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add auth header for SSO tab
      if (tab === 'sso' && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await api.get(
        `/dashboard/presales/?wallet_address=${walletAddress}&page=${page}&tab=${tab}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching presales:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["paginatedPresales", walletAddress, page, tab],
    queryFn: fetchData,
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    keepPreviousData: true, // Keep previous page data while loading new page
    ...options,
  });
}

// Platform Tokens Hook
export function usePlatformTokens(options = {}) {
  return useApiQuery(["platformTokens"], "/presale/tokens/", {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Payment Tokens Hook
export function usePaymentTokens(options = {}) {
  return useApiQuery(["paymentTokens"], "/presale/payment-tokens/", {
    staleTime: 10 * 60 * 1000, // 10 minutes (payment tokens don't change often)
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ========================================
// TICKETING SYSTEM API HOOKS
// ========================================

// Add authentication header for SSO users
const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
    }
  }
  return { 'Content-Type': 'application/json' };
};

// Get ticket categories
export function useTicketCategories(options = {}) {
  const fetchData = async () => {
    try {
      const response = await api.get("/tickets/categories/", {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket categories:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["ticketCategories"],
    queryFn: fetchData,
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Get user's tickets with filtering
export function useMyTickets(filters = {}, options = {}) {
  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/tickets/my-tickets/?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching my tickets:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["myTickets", filters],
    queryFn: fetchData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Get ticket details
export function useTicketDetails(ticketId, options = {}) {
  const fetchData = async () => {
    try {
      const response = await api.get(`/tickets/tickets/${ticketId}/`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket ${ticketId}:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["ticketDetails", ticketId],
    queryFn: fetchData,
    enabled: !!ticketId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Get ticket comments
export function useTicketComments(ticketId, options = {}) {
  const fetchData = async () => {
    try {
      const response = await api.get(`/tickets/tickets/${ticketId}/comments/`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for ticket ${ticketId}:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["ticketComments", ticketId],
    queryFn: fetchData,
    enabled: !!ticketId,
    staleTime: 30 * 1000, // 30 seconds (comments need frequent updates)
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    ...options,
  });
}

// Get ticket attachments
export function useTicketAttachments(ticketId, options = {}) {
  const fetchData = async () => {
    try {
      const response = await api.get(`/tickets/tickets/${ticketId}/attachments/`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attachments for ticket ${ticketId}:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["ticketAttachments", ticketId],
    queryFn: fetchData,
    enabled: !!ticketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Create new ticket
export function useCreateTicket(options = {}) {
  return useMutation({
    mutationFn: async (ticketData) => {
      try {
        const response = await api.post("/tickets/tickets/", ticketData, {
          headers: getAuthHeaders()
        });
        return response.data;
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }
    },
    ...options,
  });
}

// Add comment to ticket
export function useAddComment(options = {}) {
  return useMutation({
    mutationFn: async ({ ticketId, content }) => {
      try {
        const response = await api.post(`/tickets/tickets/${ticketId}/comments/`, 
          { content }, 
          { headers: getAuthHeaders() }
        );
        return response.data;
      } catch (error) {
        console.error(`Error adding comment to ticket ${ticketId}:`, error);
        throw error;
      }
    },
    ...options,
  });
}

// Upload attachment to ticket
export function useUploadAttachment(options = {}) {
  return useMutation({
    mutationFn: async ({ ticketId, formData }) => {
      try {
        // Try SSO token first, then fallback to auth_token
        const ssoToken = localStorage.getItem('sso_access_token');
        const authToken = localStorage.getItem('auth_token');
        const token = ssoToken || authToken;
        
        console.log('Upload attachment - Token check:', {
          hasSsoToken: !!ssoToken,
          hasAuthToken: !!authToken,
          usingToken: token ? 'found' : 'none'
        });
        
        const headers = token ? 
          { 'Authorization': `Bearer ${token}` } : 
          {};
        
        // Use fetch instead of axios for FormData to avoid Content-Type conflicts
        const response = await fetch(`${API_URL}/tickets/tickets/${ticketId}/attachments/`, {
          method: 'POST',
          headers: {
            ...headers
            // Don't set Content-Type - let browser set it for multipart/form-data
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          throw new Error(JSON.stringify(errorData));
        }

        return await response.json();
      } catch (error) {
        console.error(`Error uploading attachment to ticket ${ticketId}:`, error);
        throw error;
      }
    },
    ...options,
  });
}

// Close ticket
export function useCloseTicket(options = {}) {
  return useMutation({
    mutationFn: async ({ ticketId, comment }) => {
      try {
        const response = await api.post(`/tickets/tickets/${ticketId}/close/`, 
          comment ? { comment } : {}, 
          { headers: getAuthHeaders() }
        );
        return response.data;
      } catch (error) {
        console.error(`Error closing ticket ${ticketId}:`, error);
        throw error;
      }
    },
    ...options,
  });
}

// Export the api instance for direct use
export default api;
