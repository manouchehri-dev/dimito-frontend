"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow, format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import {
    X,
    MessageCircle,
    Paperclip,
    Send,
    User,
    Clock,
    CheckCircle,
    XCircle as CloseIcon
} from "lucide-react";
import {
    useTicketDetails,
    useTicketComments,
    useAddComment,
    useCloseTicket
} from "@/lib/api";
import { toast } from "react-hot-toast";

const STATUS_COLORS = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-orange-100 text-orange-800",
    PENDING: "bg-purple-100 text-purple-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800"
};

const PRIORITY_COLORS = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800"
};

export default function TicketDetailsModal({ isOpen, onClose, ticket, onTicketUpdated }) {
    const [newComment, setNewComment] = useState('');
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const t = useTranslations("support");
    const locale = useLocale();
    const dateLocale = locale === "fa" ? faIR : enUS;

    const {
        data: ticketDetails,
        isLoading: detailsLoading,
        refetch: refetchDetails
    } = useTicketDetails(ticket?.id, {
        enabled: !!ticket?.id && isOpen
    });

    const {
        data: commentsData,
        isLoading: commentsLoading,
        refetch: refetchComments
    } = useTicketComments(ticket?.id, {
        enabled: !!ticket?.id && isOpen
    });

    const addCommentMutation = useAddComment({
        onSuccess: () => {
            setNewComment('');
            refetchComments();
            onTicketUpdated();
            toast.success(t("commentAdded"));
        },
        onError: () => {
            toast.error(t("commentError"));
        }
    });

    const closeTicketMutation = useCloseTicket({
        onSuccess: () => {
            setShowCloseConfirm(false);
            refetchDetails();
            onTicketUpdated();
            toast.success(t("ticketClosed"));
        },
        onError: () => {
            toast.error(t("closeTicketError"));
        }
    });

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        addCommentMutation.mutate({
            ticketId: ticket.id,
            content: newComment.trim()
        });
    };

    const handleCloseTicket = () => {
        closeTicketMutation.mutate({
            ticketId: ticket.id
        });
    };

    if (!isOpen || !ticket) return null;

    const currentTicket = ticketDetails || ticket;
    const comments = commentsData?.results || [];
    const canClose = ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(currentTicket.status);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentTicket.ticket_id}
                            </h2>
                            <p className="text-sm text-gray-600">{currentTicket.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[currentTicket.status]}`}>
                                {t(`status.${currentTicket.status.toLowerCase()}`)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[currentTicket.priority]}`}>
                                {t(`priority.${currentTicket.priority.toLowerCase()}`)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex h-[calc(90vh-140px)]">
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Ticket Info */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">{t("created")}</p>
                                    <p className="font-medium">
                                        {format(new Date(currentTicket.created_at), 'PPp', { locale: dateLocale })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">{t("lastUpdated")}</p>
                                    <p className="font-medium">
                                        {formatDistanceToNow(new Date(currentTicket.updated_at), {
                                            addSuffix: true,
                                            locale: dateLocale
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500">{t("category")}</p>
                                    <p className="font-medium">{currentTicket.category?.name ? (t(`categories.${currentTicket.category.name}`) || currentTicket.category.name) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">{t("assignedTo")}</p>
                                    <p className="font-medium">
                                        {currentTicket.assigned_to?.display_name || t("unassigned")}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <p className="text-gray-500 text-sm mb-2">{t("description")}</p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-900 whitespace-pre-wrap">
                                        {currentTicket.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageCircle className="w-5 h-5 text-gray-400" />
                                <h3 className="font-semibold text-gray-900">{t("comments")}</h3>
                                <span className="text-sm text-gray-500">({comments.length})</span>
                            </div>

                            {commentsLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                                    <div className="h-16 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">{t("noComments")}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        {comment.author.display_name}
                                                    </span>
                                                    {comment.is_staff_reply && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {t("staff")}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {formatDistanceToNow(new Date(comment.created_at), {
                                                            addSuffix: true,
                                                            locale: dateLocale
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-gray-900 whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Comment Form */}
                        {currentTicket.status !== 'CLOSED' && (
                            <div className="p-6 border-t border-gray-200">
                                <form onSubmit={handleAddComment} className="flex gap-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder={t("addCommentPlaceholder")}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                            disabled={addCommentMutation.isPending}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || addCommentMutation.isPending}
                                        className="px-4 py-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {addCommentMutation.isPending ? t("sending") : t("send")}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 border-l border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">{t("actions")}</h3>

                        {canClose && (
                            <div className="space-y-3">
                                {!showCloseConfirm ? (
                                    <button
                                        onClick={() => setShowCloseConfirm(true)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                        {t("closeTicket")}
                                    </button>
                                ) : (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-800 mb-3">{t("closeConfirm")}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCloseTicket}
                                                disabled={closeTicketMutation.isPending}
                                                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {closeTicketMutation.isPending ? t("closing") : t("confirm")}
                                            </button>
                                            <button
                                                onClick={() => setShowCloseConfirm(false)}
                                                className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                                            >
                                                {t("cancel")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ticket Info */}
                        <div className="mt-6 space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">{t("ticketInfo")}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("id")}</span>
                                        <span className="font-mono">{currentTicket.ticket_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("status")}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[currentTicket.status]}`}>
                                            {t(`status.${currentTicket.status.toLowerCase()}`)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t("priority")}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${PRIORITY_COLORS[currentTicket.priority]}`}>
                                            {t(`priority.${currentTicket.priority.toLowerCase()}`)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
