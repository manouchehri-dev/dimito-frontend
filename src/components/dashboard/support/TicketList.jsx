"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { useRouter } from "@/i18n/navigation";
import {
    MessageCircle,
    Paperclip,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw
} from "lucide-react";

const STATUS_COLORS = {
    OPEN: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-200",
    PENDING: "bg-purple-100 text-purple-800 border-purple-200",
    RESOLVED: "bg-green-100 text-green-800 border-green-200",
    CLOSED: "bg-gray-100 text-gray-800 border-gray-200"
};

const PRIORITY_COLORS = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800"
};

const STATUS_ICONS = {
    OPEN: Clock,
    IN_PROGRESS: RefreshCw,
    PENDING: AlertCircle,
    RESOLVED: CheckCircle,
    CLOSED: XCircle
};

export default function TicketList({ tickets, searchQuery, isLoading, error }) {
    const t = useTranslations("support");
    const locale = useLocale();
    const isRTL = locale === "fa";
    const router = useRouter();
    const dateLocale = locale === "fa" ? faIR : enUS;

    // Filter tickets based on search query
    const filteredTickets = tickets.filter(ticket => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            ticket.title.toLowerCase().includes(query) ||
            ticket.ticket_id.toLowerCase().includes(query) ||
            ticket.category?.name.toLowerCase().includes(query)
        );
    });

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("error.title")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {t("error.message")}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        {t("tryAgain")}
                    </button>
                </div>
            </div>
        );
    }

    if (filteredTickets.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery ? t("noSearchResults") : t("noTickets")}
                    </h3>
                    <p className="text-gray-600">
                        {searchQuery ? t("noSearchResultsDesc") : t("noTicketsDesc")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6">
                <div className="space-y-3">
                    {filteredTickets.map((ticket) => {
                        const StatusIcon = STATUS_ICONS[ticket.status];
                        const timeAgo = formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: true,
                            locale: dateLocale
                        });

                        return (
                            <div
                                key={ticket.id}
                                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                                className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Ticket Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-gray-500">
                                                {ticket.ticket_id}
                                            </span>
                                            {ticket.category && (
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                                                    style={{
                                                        backgroundColor: `${ticket.category.color}20`,
                                                        color: ticket.category.color,
                                                        borderColor: `${ticket.category.color}40`
                                                    }}
                                                >
                                                    {ticket.category.icon && (
                                                        <span className="mr-1">{ticket.category.icon}</span>
                                                    )}
                                                    {t(`categories.${ticket.category.name}`) || ticket.category.name}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1 truncate">
                                            {ticket.title}
                                        </h3>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{timeAgo}</span>
                                            {ticket.comments_count > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>{ticket.comments_count}</span>
                                                </div>
                                            )}
                                            {ticket.attachments_count > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Paperclip className="w-4 h-4" />
                                                    <span>{ticket.attachments_count}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status and Priority */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border gap-1 ${STATUS_COLORS[ticket.status]}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {t(`status.${ticket.status.toLowerCase()}`)}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                                                {t(`priority.${ticket.priority.toLowerCase()}`)}
                                            </span>
                                        </div>

                                        {ticket.is_overdue && (
                                            <span className="text-xs text-red-600 font-medium">
                                                {t("overdue")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
