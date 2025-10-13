"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  isTokenExpired,
  shouldRefreshToken,
  getTimeUntilExpiry,
  refreshJWTToken,
  getTokenInfo,
} from "@/lib/auth/jwtUtils";
import useAuthStore from "@/stores/useAuthStore";

/**
 * Custom hook for automatic JWT token management
 * Implements best practices:
 * 1. Monitors token expiry in real-time
 * 2. Proactively refreshes tokens 5 minutes before expiry
 * 3. Handles refresh failures gracefully
 * 4. Provides token status information
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Enable automatic token refresh (default: true)
 * @param {number} options.refreshBuffer - Minutes before expiry to refresh (default: 5)
 * @param {boolean} options.enableMonitoring - Enable background monitoring (default: true)
 * @returns {Object} Token management state and methods
 */
export function useTokenManagement(options = {}) {
  const {
    autoRefresh = true,
    refreshBuffer = 5,
    enableMonitoring = true,
  } = options;

  const { loginWithSSO, logout, isAuthenticated, authMethod } = useAuthStore();

  const [tokenInfo, setTokenInfo] = useState(() => getTokenInfo());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [refreshError, setRefreshError] = useState(null);

  const refreshIntervalRef = useRef(null);
  const monitorIntervalRef = useRef(null);

  /**
   * Refresh the JWT token
   */
  const refresh = useCallback(async () => {
    // Only refresh for SSO authentication
    if (authMethod !== "sso") {
      console.log("⏭️ Skipping JWT refresh - not using SSO auth");
      return null;
    }

    if (isRefreshing) {
      console.log("⏭️ Refresh already in progress, skipping");
      return null;
    }

    setIsRefreshing(true);
    setRefreshError(null);

    try {
      console.log("🔄 Manually refreshing JWT token...");
      const newTokenData = await refreshJWTToken();

      if (newTokenData) {
        // Update auth store with new token
        loginWithSSO(
          newTokenData.token,
          newTokenData.user,
          newTokenData.expiry
        );

        setLastRefreshTime(Date.now());
        setTokenInfo(getTokenInfo());

        console.log("✅ Token refresh successful");
        return newTokenData;
      } else {
        console.error("❌ Token refresh failed");
        setRefreshError("Token refresh failed");

        // Clear auth state and redirect to login
        logout();

        return null;
      }
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      setRefreshError(error.message || "Token refresh failed");

      // Clear auth state
      logout();

      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loginWithSSO, logout, authMethod]);

  /**
   * Check token status and refresh if needed
   */
  const checkAndRefresh = useCallback(async () => {
    if (authMethod !== "sso") return;

    const info = getTokenInfo();
    setTokenInfo(info);

    // If token is expired, logout
    if (info.isExpired) {
      console.log("❌ Token expired, logging out");
      logout();
      return;
    }

    // If token should be refreshed and auto-refresh is enabled
    if (autoRefresh && shouldRefreshToken(refreshBuffer)) {
      console.log(`⏰ Token expires soon, auto-refreshing...`);
      await refresh();
    }
  }, [autoRefresh, refreshBuffer, refresh, logout, authMethod]);

  /**
   * Start background monitoring
   */
  const startMonitoring = useCallback(() => {
    if (!enableMonitoring || authMethod !== "sso") return;

    console.log("👀 Starting token monitoring...");

    // Update token info every second
    monitorIntervalRef.current = setInterval(() => {
      const info = getTokenInfo();
      setTokenInfo(info);
    }, 1000);

    // Check and refresh every minute
    refreshIntervalRef.current = setInterval(() => {
      checkAndRefresh();
    }, 60000); // Check every minute
  }, [enableMonitoring, checkAndRefresh, authMethod]);

  /**
   * Stop background monitoring
   */
  const stopMonitoring = useCallback(() => {
    console.log("🛑 Stopping token monitoring...");

    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Initialize monitoring when component mounts
  useEffect(() => {
    if (isAuthenticated && authMethod === "sso") {
      // Initial check
      checkAndRefresh();

      // Start monitoring
      startMonitoring();
    }

    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [
    isAuthenticated,
    authMethod,
    checkAndRefresh,
    startMonitoring,
    stopMonitoring,
  ]);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      const info = getTokenInfo();
      setTokenInfo(info);
    };

    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return {
    // Token status
    tokenInfo,
    isExpired: tokenInfo.isExpired,
    timeUntilExpiry: tokenInfo.timeUntilExpiry,
    shouldRefresh: tokenInfo.shouldRefresh,
    expiresAt: tokenInfo.expiresAt,

    // Refresh state
    isRefreshing,
    lastRefreshTime,
    refreshError,

    // Methods
    refresh,
    checkAndRefresh,
    startMonitoring,
    stopMonitoring,

    // Utilities
    getFormattedTimeLeft: () => {
      const seconds = tokenInfo.timeUntilExpiry;
      if (seconds === 0) return "Expired";

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${secs}s`;
      return `${secs}s`;
    },
  };
}

/**
 * Lightweight hook to get current token status
 * Useful for components that only need to display token info
 */
export function useTokenStatus() {
  const [tokenInfo, setTokenInfo] = useState(() => getTokenInfo());

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setTokenInfo(getTokenInfo());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isExpired: tokenInfo.isExpired,
    timeUntilExpiry: tokenInfo.timeUntilExpiry,
    expiresAt: tokenInfo.expiresAt,
    shouldRefresh: tokenInfo.shouldRefresh,
  };
}

export default useTokenManagement;
