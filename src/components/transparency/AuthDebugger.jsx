"use client";

import { useAuthStore } from "@/lib/auth/authStore";
import { useTokenOptions, useReports } from "@/lib/transparency/transparencyQueries";
import { Button } from "@/components/ui/button";

/**
 * Debug component to test authentication and API calls
 */
export default function AuthDebugger() {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const { data: tokenOptions, isLoading: loadingTokens, error: tokenError, refetch: refetchTokens } = useTokenOptions();
  const { data: reportsResponse, isLoading: loadingReports, error: reportsError, refetch: refetchReports } = useReports();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Authentication Debug</h2>
      
      <div className="space-y-4">
        <div>
          <strong>Authentication Status:</strong>
          <p>Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}</p>
          <p>Has Token: {accessToken ? "✅ Yes" : "❌ No"}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : "None"}</p>
        </div>

        <div>
          <strong>Token Options API Test:</strong>
          <p>Loading: {loadingTokens ? "Yes" : "No"}</p>
          <p>Error: {tokenError ? JSON.stringify(tokenError, null, 2) : "None"}</p>
          <p>Data: {tokenOptions ? JSON.stringify(tokenOptions, null, 2) : "None"}</p>
          
          <Button onClick={() => refetchTokens()} className="mt-2 mr-2">
            Retry Token Options
          </Button>
        </div>

        <div>
          <strong>Reports API Test:</strong>
          <p>Loading: {loadingReports ? "Yes" : "No"}</p>
          <p>Error: {reportsError ? JSON.stringify(reportsError, null, 2) : "None"}</p>
          <p>Data: {reportsResponse ? JSON.stringify(reportsResponse, null, 2) : "None"}</p>
          
          <Button onClick={() => refetchReports()} className="mt-2">
            Retry Reports
          </Button>
        </div>

        <div>
          <strong>Local Storage:</strong>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {typeof window !== "undefined" ? 
              localStorage.getItem("transparency-auth-storage") || "No auth data in localStorage"
              : "Server side"
            }
          </pre>
        </div>
      </div>
    </div>
  );
}