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

// Export the api instance for direct use
export default api;
