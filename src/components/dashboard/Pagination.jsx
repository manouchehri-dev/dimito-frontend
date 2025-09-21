"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showInfo = true,
  totalItems = 0,
  itemsPerPage = 10 
}) {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pages = generatePageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="bg-white px-4 sm:px-6 py-4 border-t border-gray-200 rounded-b-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Info */}
        {showInfo && (
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
        )}
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Page Numbers - Hide on very small screens, show simplified on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            {pages.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    page === currentPage
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          {/* Mobile Page Info - Show on small screens */}
          <div className="sm:hidden px-3 py-2 text-sm text-gray-700">
            {currentPage} / {totalPages}
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
