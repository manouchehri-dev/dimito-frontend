"use client";

import { useEffect } from "react";
import { useTokenManagement } from "@/hooks/useTokenManagement";
import useAuthStore from "@/stores/useAuthStore";

/**
 * TokenMonitor Component
 * Background component that monitors JWT token expiry and handles automatic refresh
 *
 * Features:
 * - Automatic token refresh 5 minutes before expiry
 * - Real-time token status monitoring
 * - Graceful logout on token expiration
 * - No UI - runs silently in the background
 *
 * Usage:
 * Add this component to your root layout (only for SSO authenticated users)
 *
 * @example
 * <TokenMonitor />
 */
export default function TokenMonitor() {
  const { isAuthenticated, authMethod } = useAuthStore();

  const { tokenInfo, isRefreshing, refreshError, refresh } = useTokenManagement(
    {
      autoRefresh: true,
      refreshBuffer: 5, // Refresh 5 minutes before expiry
      enableMonitoring: true,
    }
  );

  // Log token status periodically (for debugging)
  useEffect(() => {
    if (isAuthenticated && authMethod === "sso") {
      const logInterval = setInterval(() => {
        if (tokenInfo.hasToken && !tokenInfo.isExpired) {
          const timeLeft = Math.floor(tokenInfo.timeUntilExpiry / 60);
          console.log(`🔐 Token valid for ${timeLeft} more minutes`);
        }
      }, 5 * 60 * 1000); // Log every 5 minutes

      return () => clearInterval(logInterval);
    }
  }, [isAuthenticated, authMethod, tokenInfo]);

  // Show warning in console when token is about to expire
  useEffect(() => {
    if (
      isAuthenticated &&
      authMethod === "sso" &&
      tokenInfo.shouldRefresh &&
      !isRefreshing
    ) {
      const minutesLeft = Math.floor(tokenInfo.timeUntilExpiry / 60);
      console.warn(
        `⚠️ Token expires in ${minutesLeft} minutes - auto-refresh will trigger soon`
      );
    }
  }, [isAuthenticated, authMethod, tokenInfo, isRefreshing]);

  // Log refresh errors
  useEffect(() => {
    if (refreshError) {
      console.error("❌ Token refresh error:", refreshError);
    }
  }, [refreshError]);

  // No UI - this component runs silently in the background
  return null;
}

/**
 * TokenStatusIndicator Component (Optional)
 * Visual indicator showing token expiry status
 * Can be used in dashboard header or navbar
 */
export function TokenStatusIndicator() {
  const { isAuthenticated, authMethod } = useAuthStore();
  const { tokenInfo, isRefreshing } = useTokenManagement({
    autoRefresh: true,
    enableMonitoring: true,
  });

  // Only show for SSO authentication
  if (!isAuthenticated || authMethod !== "sso") {
    return null;
  }

  const minutesLeft = Math.floor(tokenInfo.timeUntilExpiry / 60);
  const hoursLeft = Math.floor(minutesLeft / 60);

  // Determine status color
  let statusColor = "text-green-600";
  let bgColor = "bg-green-100";

  if (tokenInfo.isExpired) {
    statusColor = "text-red-600";
    bgColor = "bg-red-100";
  } else if (tokenInfo.shouldRefresh) {
    statusColor = "text-yellow-600";
    bgColor = "bg-yellow-100";
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor}`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isRefreshing
              ? "animate-pulse bg-blue-500"
              : statusColor.replace("text-", "bg-")
          }`}
        ></div>
        <span className={`text-xs font-medium ${statusColor}`}>
          {tokenInfo.isExpired
            ? "Session Expired"
            : isRefreshing
            ? "Refreshing..."
            : hoursLeft > 0
            ? `${hoursLeft}h left`
            : `${minutesLeft}m left`}
        </span>
      </div>
    </div>
  );
}

/**
 * TokenExpiryWarning Component (Optional)
 * Shows a warning banner when token is about to expire
 */
export function TokenExpiryWarning() {
  const { isAuthenticated, authMethod } = useAuthStore();
  const { tokenInfo, refresh, isRefreshing } = useTokenManagement({
    autoRefresh: true,
    enableMonitoring: true,
  });

  // Only show for SSO authentication when token is expiring soon (< 5 minutes)
  if (
    !isAuthenticated ||
    authMethod !== "sso" ||
    !tokenInfo.shouldRefresh ||
    tokenInfo.isExpired
  ) {
    return null;
  }

  const minutesLeft = Math.floor(tokenInfo.timeUntilExpiry / 60);

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Your session will expire in{" "}
              <strong>
                {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}
              </strong>
              .
              {isRefreshing
                ? " Refreshing session..."
                : " Session will auto-refresh soon."}
            </p>
          </div>
        </div>
        {!isRefreshing && (
          <button
            onClick={refresh}
            className="ml-4 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium rounded-md transition-colors"
          >
            Refresh Now
          </button>
        )}
      </div>
    </div>
  );
}
