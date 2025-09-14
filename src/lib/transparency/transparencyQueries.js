import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { transparencyService } from "./transparencyService";

// Query keys for React Query
export const transparencyKeys = {
  all: ["transparency"],
  reports: () => [...transparencyKeys.all, "reports"],
  report: (id) => [...transparencyKeys.reports(), id],
  tokenOptions: () => [...transparencyKeys.all, "token-options"],
  reportTypes: () => [...transparencyKeys.all, "report-types"],
  authors: () => [...transparencyKeys.all, "authors"],
  mineOptions: (tokenId) => [...transparencyKeys.all, "mine-options", tokenId],
};

/**
 * Hook to fetch token options
 */
export function useTokenOptions() {
  return useQuery({
    queryKey: transparencyKeys.tokenOptions(),
    queryFn: transparencyService.getTokenOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch report types
 */
export function useReportTypes() {
  return useQuery({
    queryKey: transparencyKeys.reportTypes(),
    queryFn: transparencyService.getReportTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch authors for filtering
 */
export function useAuthors() {
  return useQuery({
    queryKey: transparencyKeys.authors(),
    queryFn: transparencyService.getAuthors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch mine options for a specific token
 */
export function useMineOptions(tokenId) {
  return useQuery({
    queryKey: transparencyKeys.mineOptions(tokenId),
    queryFn: () => transparencyService.getMineOptions(tokenId),
    enabled: !!tokenId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch user's own reports (authenticated - includes drafts and published)
 * @param {Object} params - Query parameters
 */
export function useUserReports(params = {}) {
  return useQuery({
    queryKey: [...transparencyKeys.reports(), "user", params],
    queryFn: () => transparencyService.getUserReports(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch all reports (authenticated - includes drafts)
 * @param {Object} params - Query parameters
 */
export function useAllReports(params = {}) {
  return useQuery({
    queryKey: [...transparencyKeys.reports(), "all", params],
    queryFn: () => transparencyService.getAllReports(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch public reports (only published)
 * @param {Object} params - Query parameters
 */
export function usePublicReports(params = {}) {
  return useQuery({
    queryKey: [...transparencyKeys.reports(), "public", params],
    queryFn: () => transparencyService.getPublicReports(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Legacy hook - kept for backward compatibility
 * @deprecated Use useAllReports or usePublicReports instead
 */
export function useReports(params = {}) {
  return useAllReports(params);
}

/**
 * Hook to fetch reports with infinite scroll support
 * @param {Object} params - Base query parameters
 */
export function useInfiniteReports(params = {}) {
  return useInfiniteQuery({
    queryKey: [...transparencyKeys.reports(), "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      transparencyService.getReports({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // If there's a next page URL, extract page number or return next page
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get("page");
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a specific report
 */
export function useReport(reportId) {
  return useQuery({
    queryKey: transparencyKeys.report(reportId),
    queryFn: () => transparencyService.getReport(reportId),
    enabled: !!reportId,
  });
}

/**
 * Hook to create a new report
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transparencyService.createReport,
    onSuccess: (data) => {
      // Invalidate and refetch reports list
      queryClient.invalidateQueries({ queryKey: transparencyKeys.reports() });
      // Add the new report to the cache
      queryClient.setQueryData(transparencyKeys.report(data.id), data);
    },
    onError: (error) => {
      console.error("Create report mutation failed:", error);
    },
  });
}

/**
 * Hook to upload attachments to a report
 */
export function useUploadAttachments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, files }) =>
      transparencyService.uploadAttachments(reportId, files),
    onSuccess: (data, variables) => {
      // Invalidate the specific report to refetch with new attachments
      queryClient.invalidateQueries({
        queryKey: transparencyKeys.report(variables.reportId),
      });
      // Also invalidate reports list in case it shows attachment counts
      queryClient.invalidateQueries({ queryKey: transparencyKeys.reports() });
    },
    onError: (error) => {
      console.error("Upload attachments mutation failed:", error);
    },
  });
}

/**
 * Hook to toggle report publish status
 */
export function useTogglePublishReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, isPublished }) =>
      transparencyService.togglePublishReport(reportId, isPublished),
    onSuccess: (data, variables) => {
      // Update the specific report in cache
      queryClient.setQueryData(
        transparencyKeys.report(variables.reportId),
        data
      );
      // Invalidate reports list to reflect publish status changes
      queryClient.invalidateQueries({ queryKey: transparencyKeys.reports() });
    },
    onError: (error) => {
      console.error("Toggle publish report mutation failed:", error);
    },
  });
}
