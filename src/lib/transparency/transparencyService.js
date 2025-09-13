import { httpClient } from "@/lib/auth/httpClient";

const TRANSPARENCY_BASE_URL = "/transparency";

/**
 * Transparency Reports Service
 * Handles all transparency report related API calls
 */
export const transparencyService = {
  /**
   * Get available token options for reports
   * @returns {Promise<Array>} Array of token options
   */
  async getTokenOptions() {
    try {
      // Debug: Check if we have auth token
      if (typeof window !== "undefined") {
        const { useAuthStore } = require("@/lib/auth/authStore");
        const token = useAuthStore.getState().accessToken;
        console.log("Token available for token options:", !!token);
      }

      const response = await httpClient.get("/presale/tokens/");

      // Return the results array from the paginated response
      return response.data.results || response.data;
    } catch (error) {
      console.error("Failed to fetch token options:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Create a new transparency report
   * @param {Object} reportData - Report data
   * @param {string} reportData.title - Report title
   * @param {number} reportData.token - Token ID
   * @param {string} reportData.description - Report description
   * @returns {Promise<Object>} Created report data
   */
  async createReport(reportData) {
    try {
      // Debug: Check if we have auth token
      if (typeof window !== "undefined") {
        const { useAuthStore } = require("@/lib/auth/authStore");
        const token = useAuthStore.getState().accessToken;
        console.log("Token available for create report:", !!token);
        console.log("Report data:", reportData);
      }

      const response = await httpClient.post(
        `${TRANSPARENCY_BASE_URL}/reports/`,
        reportData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create report:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Upload attachments to a report
   * @param {number} reportId - Report ID
   * @param {FileList|Array} files - Files to upload
   * @returns {Promise<Object>} Upload response
   */
  async uploadAttachments(reportId, files) {
    try {
      const formData = new FormData();

      // Add files to FormData
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await httpClient.post(
        `${TRANSPARENCY_BASE_URL}/reports/${reportId}/attachments/bulk-upload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to upload attachments:", error);
      throw error;
    }
  },

  /**
   * Publish or unpublish a report
   * @param {number} reportId - Report ID
   * @param {boolean} isPublished - Whether to publish or unpublish
   * @returns {Promise<Object>} Updated report data
   */
  async togglePublishReport(reportId, isPublished) {
    try {
      const response = await httpClient.patch(
        `${TRANSPARENCY_BASE_URL}/reports/${reportId}/publish/`,
        { is_published: isPublished }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to toggle report publish status:", error);
      throw error;
    }
  },

  /**
   * Get user's own reports (authenticated - includes drafts and published)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (optional)
   * @param {number} params.page_size - Page size (optional)
   * @param {string} params.search - Free text search (title/desc/token fields)
   * @param {number} params.token - Filter by token ID
   * @param {number} params.report_type - Filter by report type ID
   * @param {string} params.title - Filter by title (icontains)
   * @param {string} params.date_from - Filter by created date from (ISO format)
   * @param {string} params.date_to - Filter by created date to (ISO format)
   * @param {boolean} params.is_published - Filter by published status
   * @param {string} params.ordering - Ordering (-created_date, title, token__token_symbol)
   * @returns {Promise<Object>} Paginated reports response
   */
  async getUserReports(params = {}) {
    try {
      // Debug: Check if we have auth token for authenticated requests
      if (typeof window !== "undefined") {
        const { useAuthStore } = require("@/lib/auth/authStore");
        const token = useAuthStore.getState().accessToken;
        console.log("Token available for get user reports:", !!token);
        console.log("Query params:", params);
      }

      const response = await httpClient.get(
        `${TRANSPARENCY_BASE_URL}/reports/`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user reports:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Get all reports (paginated response with search and filters)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (optional)
   * @param {number} params.page_size - Page size (optional)
   * @param {string} params.search - Free text search (title/desc/token fields)
   * @param {number} params.token - Filter by token ID
   * @param {number} params.report_type - Filter by report type ID
   * @param {string} params.author - Filter by author username (icontains)
   * @param {string} params.title - Filter by title (icontains)
   * @param {string} params.date_from - Filter by created date from (ISO format)
   * @param {string} params.date_to - Filter by created date to (ISO format)
   * @param {boolean} params.is_published - Filter by published status
   * @param {string} params.ordering - Ordering (-created_date, title, token__token_symbol)
   * @returns {Promise<Object>} Paginated reports response
   */
  async getAllReports(params = {}) {
    try {
      // Debug: Check if we have auth token for authenticated requests
      if (typeof window !== "undefined") {
        const { useAuthStore } = require("@/lib/auth/authStore");
        const token = useAuthStore.getState().accessToken;
        console.log("Token available for get all reports:", !!token);
        console.log("Query params:", params);
      }

      const response = await httpClient.get(
        `${TRANSPARENCY_BASE_URL}/reports/all/`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch all reports:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Get public reports (only published, no authentication required)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated reports response
   */
  async getPublicReports(params = {}) {
    try {
      // Force published filter for public access
      const publicParams = {
        ...params,
        is_published: true,
      };

      console.log("Fetching public reports with params:", publicParams);

      const response = await httpClient.get(
        `${TRANSPARENCY_BASE_URL}/reports/all/`,
        { params: publicParams }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch public reports:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use getAllReports or getPublicReports instead
   */
  async getReports(params = {}) {
    return this.getAllReports(params);
  },

  /**
   * Get a specific report by ID
   * @param {number} reportId - Report ID
   * @returns {Promise<Object>} Report data
   */
  async getReport(reportId) {
    try {
      const response = await httpClient.get(
        `${TRANSPARENCY_BASE_URL}/reports/${reportId}/`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch report:", error);
      throw error;
    }
  },

  /**
   * Get available report types for filtering
   * @returns {Promise<Array>} Array of report types
   */
  async getReportTypes() {
    try {
      const response = await httpClient.get(
        `${TRANSPARENCY_BASE_URL}/report-types/`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch report types:", error);
      throw error;
    }
  },

  /**
   * Get available authors for filtering
   * @returns {Promise<Array>} Array of authors
   */
  async getAuthors() {
    try {
      const response = await httpClient.get(
        `${TRANSPARENCY_BASE_URL}/authors/`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch authors:", error);
      throw error;
    }
  },
};
