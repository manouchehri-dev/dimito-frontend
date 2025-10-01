"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  RefreshCw,
  Filter,
  Search,
  Ticket,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { useMyTickets, useTicketCategories } from "@/lib/api";
import useAuthStore from "@/stores/useAuthStore";
import TicketList from "./support/TicketList";
import CreateTicketModal from "./support/CreateTicketModal";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useRouter } from "@/i18n/navigation";

export default function SupportPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const t = useTranslations("support");
  const tc = useTranslations("support.categories")
  const locale = useLocale();
  const isRTL = locale === "fa";
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Check if user has SSO authentication (required for ticketing)
  const hasAuthToken = typeof window !== "undefined" && localStorage.getItem('auth_token');

  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    error: ticketsError,
    refetch: refetchTickets
  } = useMyTickets(filters, {
    enabled: hasAuthToken && isAuthenticated
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useTicketCategories({
    enabled: hasAuthToken && isAuthenticated
  });

  // Calculate statistics
  const tickets = ticketsData?.tickets || [];
  const totalTickets = ticketsData?.count || 0;
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;

  const handleCreateTicket = () => {
    setShowCreateModal(true);
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    refetchTickets();
  };

  const handleTicketClick = (ticket) => {
    router.push(`/dashboard/support/${ticket.id}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: ''
    });
    setSearchQuery('');
  };

  // Show authentication required message if no SSO token
  if (!hasAuthToken || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("authRequired")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("authRequiredDesc")}
          </p>
          <button
            onClick={() => window.location.href = `/${locale}/auth/login`}
            className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            {t("loginNow")}
          </button>
        </div>
      </div>
    );
  }

  if (ticketsLoading || categoriesLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => refetchTickets()}
            disabled={ticketsLoading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${ticketsLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t("refresh")}</span>
          </button>
          <button
            onClick={handleCreateTicket}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            {t("createTicket")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              <p className="text-sm text-gray-600">{t("totalTickets")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openTickets}</p>
              <p className="text-sm text-gray-600">{t("openTickets")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgressTickets}</p>
              <p className="text-sm text-gray-600">{t("inProgress")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resolvedTickets}</p>
              <p className="text-sm text-gray-600">{t("resolved")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t("allStatuses")}</option>
              <option value="OPEN">{t("status.open")}</option>
              <option value="IN_PROGRESS">{t("status.inProgress")}</option>
              <option value="PENDING">{t("status.pending")}</option>
              <option value="RESOLVED">{t("status.resolved")}</option>
              <option value="CLOSED">{t("status.closed")}</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t("allPriorities")}</option>
              <option value="LOW">{t("priority.low")}</option>
              <option value="MEDIUM">{t("priority.medium")}</option>
              <option value="HIGH">{t("priority.high")}</option>
              <option value="CRITICAL">{t("priority.critical")}</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t("allCategories")}</option>
              {categoriesData?.results?.map((category) => (
                <option key={category.id} value={category.id}>
                  {tc(category.name)}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.status || filters.priority || filters.category || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <TicketList
        tickets={tickets}
        searchQuery={searchQuery}
        onTicketClick={handleTicketClick}
        isLoading={ticketsLoading}
        error={ticketsError}
      />

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
          categories={categoriesData?.results || []}
        />
      )}

    </div>
  );
}
